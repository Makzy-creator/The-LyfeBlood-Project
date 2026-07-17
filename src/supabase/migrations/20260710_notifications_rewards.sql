-- Phase 7: notifications and rewards.
-- Users can read/update only their own notifications.
-- Rewards are readable by the owner through public.users and written through server/RPC only.

create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null,
  title text not null,
  message text not null,
  request_id text,
  match_id text,
  read_at timestamptz,
  deliver_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists user_id text,
  add column if not exists type text,
  add column if not exists title text,
  add column if not exists message text,
  add column if not exists request_id text,
  add column if not exists match_id text,
  add column if not exists read_at timestamptz,
  add column if not exists deliver_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now();

alter table public.users
  add column if not exists reward_points integer not null default 0;

alter table public.matches
  add column if not exists match_status text not null default 'Candidate',
  add column if not exists donation_completed_at timestamptz,
  add column if not exists reward_issued_at timestamptz,
  add column if not exists reward_points_awarded integer not null default 0;

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, read_at)
  where read_at is null;

create index if not exists idx_notifications_request
  on public.notifications (request_id);

create index if not exists idx_notifications_match
  on public.notifications (match_id);

alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_select_own'
  ) then
    create policy notifications_select_own
      on public.notifications
      for select
      using (user_id::text = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_update_own_read_at'
  ) then
    create policy notifications_update_own_read_at
      on public.notifications
      for update
      using (user_id::text = auth.uid()::text)
      with check (user_id::text = auth.uid()::text);
  end if;
end $$;

revoke all on public.notifications from anon;
grant select on public.notifications to authenticated;
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke insert, delete on public.notifications from authenticated;

grant select (reward_points) on public.users to authenticated;
revoke update (reward_points) on public.users from authenticated;

create or replace function public.create_notification(
  p_user_id text,
  p_type text,
  p_title text,
  p_message text,
  p_request_id text default null,
  p_match_id text default null,
  p_deliver_at timestamptz default null
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  submitted_notification public.notifications;
begin
  if p_user_id is null or trim(p_user_id) = '' then
    raise exception 'user_id is required';
  end if;

  if auth.uid() is not null
    and p_user_id::text <> auth.uid()::text
    and not exists (
      select 1
      from public.users
      where id::text = auth.uid()::text
        and role = 'admin'
    )
  then
    raise exception 'Forbidden';
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    request_id,
    match_id,
    deliver_at
  )
  values (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_request_id,
    p_match_id,
    coalesce(p_deliver_at, now())
  )
  returning * into submitted_notification;

  return submitted_notification;
end;
$$;

create or replace function public.issue_donation_reward(
  p_match_id text,
  p_points integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  match_row public.matches;
  donor_total integer;
begin
  if p_match_id is null or trim(p_match_id) = '' then
    raise exception 'match_id is required';
  end if;

  if p_points is null or p_points <= 0 then
    raise exception 'points must be greater than zero';
  end if;

  select *
    into match_row
  from public.matches
  where id::text = p_match_id
  for update;

  if match_row.id is null then
    raise exception 'Match not found';
  end if;

  if match_row.donation_completed_at is null then
    raise exception 'Donation is not completed';
  end if;

  if match_row.reward_issued_at is not null then
    return jsonb_build_object(
      'reward_issued', false,
      'already_issued', true,
      'match_id', match_row.id,
      'points', match_row.reward_points_awarded
    );
  end if;

  update public.users
    set reward_points = coalesce(reward_points, 0) + p_points
  where id::text = match_row.donor_id::text
  returning reward_points into donor_total;

  if donor_total is null then
    raise exception 'Donor not found';
  end if;

  update public.matches
    set reward_issued_at = now(),
        reward_points_awarded = p_points
  where id = match_row.id;

  perform public.create_notification(
    match_row.donor_id::text,
    'reward_issued',
    'Reward issued',
    'Your donation reward points have been added.',
    match_row.request_id::text,
    match_row.id::text,
    now()
  );

  return jsonb_build_object(
    'reward_issued', true,
    'already_issued', false,
    'match_id', match_row.id,
    'points', p_points,
    'reward_points', donor_total
  );
end;
$$;

create or replace function public.issue_donation_reward_on_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.donation_completed_at is not null
    and old.donation_completed_at is distinct from new.donation_completed_at
  then
    perform public.issue_donation_reward(new.id::text, 100);
  end if;

  return new;
end;
$$;

drop trigger if exists matches_issue_reward_after_completion on public.matches;

create trigger matches_issue_reward_after_completion
  after update of donation_completed_at on public.matches
  for each row
  execute function public.issue_donation_reward_on_completion();

revoke all on function public.create_notification(text, text, text, text, text, text, timestamptz) from public;
revoke all on function public.create_notification(text, text, text, text, text, text, timestamptz) from anon;
revoke all on function public.create_notification(text, text, text, text, text, text, timestamptz) from authenticated;
grant execute on function public.create_notification(text, text, text, text, text, text, timestamptz) to service_role;

revoke all on function public.issue_donation_reward(text, integer) from public;
revoke all on function public.issue_donation_reward(text, integer) from anon;
revoke all on function public.issue_donation_reward(text, integer) from authenticated;
grant execute on function public.issue_donation_reward(text, integer) to service_role;
