-- Phase 5: matches, donor responses, cooldown, and OTP verification RPCs.

alter table public.matches enable row level security;
alter table public.verification_tokens enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_select_own_donor'
  ) then
    create policy matches_select_own_donor
      on public.matches
      for select
      using (donor_id::text = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_select_request_owner'
  ) then
    create policy matches_select_request_owner
      on public.matches
      for select
      using (
        exists (
          select 1
          from public.blood_requests br
          where br.id = matches.request_id
            and (
              br.requested_by::text = auth.uid()::text
              or br.hospital_id::text = auth.uid()::text
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_update_own_donor'
  ) then
    create policy matches_update_own_donor
      on public.matches
      for update
      using (donor_id::text = auth.uid()::text)
      with check (donor_id::text = auth.uid()::text);
  end if;
end $$;

grant select on public.matches to authenticated;
revoke update on public.matches from authenticated;
grant update (
  match_status,
  responded_at
) on public.matches to authenticated;
revoke all on public.verification_tokens from anon;
revoke all on public.verification_tokens from authenticated;

create or replace function public.enforce_donor_cooldown(p_donor_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  donor_row public.users;
  remaining_days integer;
begin
  select *
    into donor_row
  from public.users
  where id::text = p_donor_id;

  if donor_row.id is null then
    raise exception 'Donor account not found';
  end if;

  if donor_row.availability_status::text not in ('1', 'true') then
    raise exception 'Donor is not currently available';
  end if;

  if donor_row.is_verified::text not in ('1', 'true') then
    raise exception 'Donor account is not verified';
  end if;

  if coalesce(donor_row.is_suspended, false) then
    raise exception 'Donor account is suspended';
  end if;

  if coalesce(donor_row.is_inactive, false) then
    raise exception 'Donor account is inactive';
  end if;

  if coalesce(donor_row.matching_opt_out, false) then
    raise exception 'Donor has opted out of matching';
  end if;

  if donor_row.last_donation_at is not null
    and donor_row.last_donation_at > now() - interval '56 days'
  then
    remaining_days := greatest(
      1,
      ceil(extract(epoch from ((donor_row.last_donation_at + interval '56 days') - now())) / 86400)::integer
    );
    raise exception 'Donor is in the 56-day cooldown period (% days remaining)', remaining_days;
  end if;
end;
$$;

create or replace function public.respond_to_match(
  p_match_id text,
  p_decision text,
  p_secure_otp text default null,
  p_expires_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  donor_id text := auth.uid()::text;
  match_row public.matches;
  request_row public.blood_requests;
  token_row public.verification_tokens;
begin
  if donor_id is null then
    raise exception 'Authentication required';
  end if;

  if p_decision not in ('Accepted', 'Declined') then
    raise exception 'decision must be Accepted or Declined';
  end if;

  select *
    into match_row
  from public.matches
  where id::text = p_match_id
    and donor_id::text = donor_id
  for update;

  if match_row.id is null then
    raise exception 'Match not found';
  end if;

  if match_row.match_status <> 'Alerted' then
    raise exception 'Match already responded to';
  end if;

  perform public.enforce_donor_cooldown(donor_id);

  select *
    into request_row
  from public.blood_requests
  where id = match_row.request_id
  for update;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  if p_decision = 'Declined' then
    update public.matches
      set match_status = 'Declined',
          responded_at = now()
    where id = match_row.id
    returning * into match_row;

    return jsonb_build_object(
      'message', 'Match declined',
      'match', to_jsonb(match_row),
      'request', to_jsonb(request_row),
      'token', null
    );
  end if;

  if nullif(p_secure_otp, '') is null or p_expires_at is null then
    raise exception 'OTP hash and expiry are required when accepting a match';
  end if;

  update public.matches
    set match_status = 'Accepted',
        responded_at = now()
  where id = match_row.id
  returning * into match_row;

  update public.blood_requests
    set status = 'donor_matched',
        matching_status = 'accepted'
  where id = match_row.request_id
  returning * into request_row;

  insert into public.verification_tokens (
    match_id,
    secure_otp,
    expires_at,
    status
  )
  values (
    match_row.id,
    p_secure_otp,
    p_expires_at,
    'Active'
  )
  returning * into token_row;

  return jsonb_build_object(
    'message', 'Match accepted',
    'match', to_jsonb(match_row),
    'request', to_jsonb(request_row),
    'token', jsonb_build_object(
      'id', token_row.id,
      'match_id', token_row.match_id,
      'expires_at', token_row.expires_at,
      'status', token_row.status
    )
  );
end;
$$;

create or replace function public.verify_donor_otp(
  p_token_id text,
  p_match_id text,
  p_verified_by text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  verifier_id text := auth.uid()::text;
  token_row public.verification_tokens;
  match_row public.matches;
  request_row public.blood_requests;
  donor_row public.users;
  verified_at timestamptz := now();
begin
  if verifier_id is null then
    raise exception 'Authentication required';
  end if;

  if p_verified_by is not null and p_verified_by <> verifier_id then
    raise exception 'Verifier mismatch';
  end if;

  select *
    into token_row
  from public.verification_tokens
  where id::text = p_token_id
    and match_id::text = p_match_id
  for update;

  if token_row.id is null then
    raise exception 'Invalid or expired OTP';
  end if;

  if token_row.status = 'Used' then
    raise exception 'OTP has already been used';
  end if;

  if token_row.status = 'Expired' or token_row.expires_at < verified_at then
    update public.verification_tokens
      set status = 'Expired'
    where id = token_row.id;
    raise exception 'OTP has expired';
  end if;

  select *
    into match_row
  from public.matches
  where id = token_row.match_id
  for update;

  if match_row.id is null or match_row.match_status <> 'Accepted' then
    raise exception 'Match is not ready for check-in';
  end if;

  select *
    into request_row
  from public.blood_requests
  where id = match_row.request_id
  for update;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  if not exists (
    select 1
    from public.users
    where id::text = verifier_id
      and role in ('hospital', 'hospital_officer', 'hospital_staff', 'admin')
  ) then
    raise exception 'Forbidden';
  end if;

  if not exists (
    select 1
    from public.users
    where id::text = verifier_id
      and (
        role = 'admin'
        or request_row.requested_by::text = verifier_id
        or request_row.hospital_id::text = verifier_id
      )
  ) then
    raise exception 'Forbidden';
  end if;

  select *
    into donor_row
  from public.users
  where id::text = match_row.donor_id::text;

  if donor_row.id is null or donor_row.is_verified::text not in ('1', 'true') then
    raise exception 'Donor identity is not verified';
  end if;

  update public.verification_tokens
    set status = 'Used',
        used_at = verified_at,
        checked_in_at = verified_at,
        verified_by = verifier_id
  where id = token_row.id
    and status = 'Active'
  returning * into token_row;

  if token_row.id is null then
    raise exception 'OTP has already been used';
  end if;

  update public.matches
    set arrived_at = coalesce(arrived_at, verified_at)
  where id = match_row.id
  returning * into match_row;

  update public.blood_requests
    set status = 'checked_in'
  where id = request_row.id
  returning * into request_row;

  return jsonb_build_object(
    'token_id', token_row.id,
    'match', to_jsonb(match_row),
    'request', to_jsonb(request_row),
    'donor', jsonb_build_object(
      'id', donor_row.id,
      'full_name', donor_row.full_name,
      'email', donor_row.email,
      'phone', donor_row.phone,
      'blood_type', donor_row.blood_type,
      'is_verified', donor_row.is_verified
    ),
    'checked_in_at', verified_at,
    'verified_by', verifier_id,
    'new_status', 'checked_in'
  );
end;
$$;

revoke all on function public.enforce_donor_cooldown(text) from public;
grant execute on function public.enforce_donor_cooldown(text) to authenticated;

revoke all on function public.respond_to_match(text, text, text, timestamptz) from public;
grant execute on function public.respond_to_match(text, text, text, timestamptz) to authenticated;

revoke all on function public.verify_donor_otp(text, text, text) from public;
grant execute on function public.verify_donor_otp(text, text, text) to authenticated;
