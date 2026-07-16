-- Phase 6: chat, donor tracking, and hospital status RPCs.

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  sender_id text not null,
  message text not null,
  quick_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.donor_locations (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  donor_id text not null,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  eta_minutes integer,
  status text not null default 'on_the_way',
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_match_created
  on public.chat_messages (match_id, created_at);

create index if not exists idx_donor_locations_match_created
  on public.donor_locations (match_id, created_at desc);

alter table public.matches
  add column if not exists match_status text not null default 'Candidate',
  add column if not exists on_the_way_at timestamptz,
  add column if not exists arrived_at timestamptz,
  add column if not exists blood_collected_at timestamptz,
  add column if not exists donation_completed_at timestamptz;

alter table public.blood_requests
  add column if not exists hospital_id text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists matching_status text not null default 'pending';

alter table public.chat_messages enable row level security;
alter table public.donor_locations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'chat_messages'
      and policyname = 'chat_messages_select_accepted_participants'
  ) then
    create policy chat_messages_select_accepted_participants
      on public.chat_messages
      for select
      using (
        exists (
          select 1
          from public.matches m
          join public.blood_requests br on br.id = m.request_id
          where m.id::text = chat_messages.match_id::text
            and m.match_status = 'Accepted'
            and (
              m.donor_id::text = auth.uid()::text
              or br.requested_by::text = auth.uid()::text
              or br.hospital_id::text = auth.uid()::text
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'chat_messages'
      and policyname = 'chat_messages_insert_accepted_participants'
  ) then
    create policy chat_messages_insert_accepted_participants
      on public.chat_messages
      for insert
      with check (
        sender_id::text = auth.uid()::text
        and exists (
          select 1
          from public.matches m
          join public.blood_requests br on br.id = m.request_id
          where m.id::text = chat_messages.match_id::text
            and m.match_status = 'Accepted'
            and (
              m.donor_id::text = auth.uid()::text
              or br.requested_by::text = auth.uid()::text
              or br.hospital_id::text = auth.uid()::text
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'donor_locations'
      and policyname = 'donor_locations_select_accepted_participants'
  ) then
    create policy donor_locations_select_accepted_participants
      on public.donor_locations
      for select
      using (
        exists (
          select 1
          from public.matches m
          join public.blood_requests br on br.id = m.request_id
          where m.id::text = donor_locations.match_id::text
            and m.match_status = 'Accepted'
            and (
              m.donor_id::text = auth.uid()::text
              or br.requested_by::text = auth.uid()::text
              or br.hospital_id::text = auth.uid()::text
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'donor_locations'
      and policyname = 'donor_locations_insert_own_donor'
  ) then
    create policy donor_locations_insert_own_donor
      on public.donor_locations
      for insert
      with check (
        donor_id::text = auth.uid()::text
        and exists (
          select 1
          from public.matches m
          where m.id::text = donor_locations.match_id::text
            and m.donor_id::text = auth.uid()::text
            and m.match_status = 'Accepted'
        )
      );
  end if;
end $$;

grant select, insert on public.chat_messages to authenticated;
grant select, insert on public.donor_locations to authenticated;

create or replace function public.update_tracking(
  p_match_id text,
  p_latitude double precision,
  p_longitude double precision,
  p_status text default 'on_the_way'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  donor_user_id text := auth.uid()::text;
  match_row public.matches;
  request_row public.blood_requests;
  location_row public.donor_locations;
  distance_value double precision := null;
  eta_value integer := null;
  status_value text := coalesce(p_status, 'on_the_way');
  recorded_at timestamptz := now();
begin
  if donor_user_id is null then
    raise exception 'Authentication required';
  end if;

  if status_value not in ('on_the_way', 'arrived') then
    raise exception 'status must be on_the_way or arrived';
  end if;

  if p_latitude is null or p_latitude < -90 or p_latitude > 90 then
    raise exception 'valid latitude is required';
  end if;

  if p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'valid longitude is required';
  end if;

  select *
    into match_row
  from public.matches
  where id::text = p_match_id
    and donor_id::text = donor_user_id
    and match_status = 'Accepted'
  for update;

  if match_row.id is null then
    raise exception 'Match not found';
  end if;

  if match_row.arrived_at is not null and status_value <> 'arrived' then
    raise exception 'Location updates are closed after arrival';
  end if;

  select *
    into request_row
  from public.blood_requests
  where id = match_row.request_id;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  if request_row.latitude is not null and request_row.longitude is not null then
    distance_value := round(
      (
        6371 * 2 * asin(
          sqrt(
            power(sin(radians((p_latitude - request_row.latitude) / 2)), 2)
            + cos(radians(request_row.latitude))
            * cos(radians(p_latitude))
            * power(sin(radians((p_longitude - request_row.longitude) / 2)), 2)
          )
        )
      )::numeric,
      2
    )::double precision;
    eta_value := greatest(1, ceil((distance_value / 25) * 60)::integer);
  end if;

  if status_value = 'arrived' then
    eta_value := 0;
  end if;

  update public.matches
    set on_the_way_at = coalesce(on_the_way_at, recorded_at),
        arrived_at = case
          when status_value = 'arrived' then coalesce(arrived_at, recorded_at)
          else arrived_at
        end
  where id = match_row.id
  returning * into match_row;

  insert into public.donor_locations (
    match_id,
    donor_id,
    latitude,
    longitude,
    distance_km,
    eta_minutes,
    status
  )
  values (
    match_row.id::text,
    match_row.donor_id::text,
    p_latitude,
    p_longitude,
    distance_value,
    eta_value,
    status_value
  )
  returning * into location_row;

  return jsonb_build_object(
    'location', to_jsonb(location_row),
    'match', to_jsonb(match_row),
    'request', to_jsonb(request_row)
  );
end;
$$;

create or replace function public.mark_hospital_status(
  p_match_id text,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id text := auth.uid()::text;
  actor_role text;
  match_row public.matches;
  request_row public.blood_requests;
  updated_request public.blood_requests;
  next_request_status text;
  action_message text;
  recorded_at timestamptz := now();
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select role
    into actor_role
  from public.users
  where id::text = actor_id;

  if actor_role not in ('hospital', 'hospital_officer', 'hospital_staff', 'admin') then
    raise exception 'Forbidden';
  end if;

  select *
    into match_row
  from public.matches
  where id::text = p_match_id
  for update;

  if match_row.id is null then
    raise exception 'Match not found';
  end if;

  if match_row.match_status <> 'Accepted' then
    raise exception 'Only accepted matches can be updated';
  end if;

  select *
    into request_row
  from public.blood_requests
  where id = match_row.request_id
  for update;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  if actor_role <> 'admin'
    and request_row.requested_by::text <> actor_id
    and coalesce(request_row.hospital_id::text, '') <> actor_id
  then
    raise exception 'Forbidden';
  end if;

  if request_row.status in ('fulfilled', 'cancelled', 'Completed', 'Cancelled') then
    raise exception 'Request is already closed';
  end if;

  if p_action = 'arrived' then
    update public.matches
      set arrived_at = coalesce(arrived_at, recorded_at)
    where id = match_row.id
    returning * into match_row;
    next_request_status := case
      when request_row.status = 'blood_collected' then 'blood_collected'
      else 'checked_in'
    end;
    action_message := 'Donor marked as arrived.';
  elsif p_action = 'blood_collected' then
    if match_row.arrived_at is null then
      raise exception 'Mark donor as arrived before recording blood collection';
    end if;
    update public.matches
      set blood_collected_at = coalesce(blood_collected_at, recorded_at)
    where id = match_row.id
    returning * into match_row;
    next_request_status := 'blood_collected';
    action_message := 'Blood collection recorded.';
  elsif p_action = 'donation_completed' then
    if match_row.blood_collected_at is null then
      raise exception 'Record blood collection before completing donation';
    end if;
    if match_row.donation_completed_at is not null then
      raise exception 'Donation is already completed';
    end if;
    update public.matches
      set donation_completed_at = recorded_at
    where id = match_row.id
    returning * into match_row;
    update public.users
      set last_donation_at = recorded_at,
          availability_status = 0
    where id::text = match_row.donor_id::text;
    next_request_status := 'fulfilled';
    action_message := 'Donation completed.';
  else
    raise exception 'action must be arrived, blood_collected, or donation_completed';
  end if;

  update public.blood_requests
    set status = next_request_status,
        matching_status = case
          when p_action = 'donation_completed' then 'completed'
          else matching_status
        end
  where id = request_row.id
  returning * into updated_request;

  return jsonb_build_object(
    'message', action_message,
    'match', to_jsonb(match_row),
    'request', to_jsonb(updated_request),
    'new_status', next_request_status,
    'verified_by', actor_id
  );
end;
$$;

revoke all on function public.update_tracking(text, double precision, double precision, text) from public;
grant execute on function public.update_tracking(text, double precision, double precision, text) to authenticated;

revoke all on function public.mark_hospital_status(text, text) from public;
grant execute on function public.mark_hospital_status(text, text) to authenticated;
