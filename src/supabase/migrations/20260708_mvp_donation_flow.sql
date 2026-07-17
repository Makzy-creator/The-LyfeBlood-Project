-- MVP hospital donation flow support.
-- Safe to rerun on Supabase/Postgres.

alter table users
  add column if not exists reward_points integer not null default 0;

alter table blood_requests
  add column if not exists request_type text not null default 'Emergency',
  add column if not exists scheduled_for timestamptz,
  add column if not exists matching_status text not null default 'pending';

alter table matches
  add column if not exists selected_at timestamptz,
  add column if not exists on_the_way_at timestamptz,
  add column if not exists arrived_at timestamptz,
  add column if not exists blood_collected_at timestamptz,
  add column if not exists donation_completed_at timestamptz;

alter table notifications
  add column if not exists deliver_at timestamptz not null default now();

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references matches(id) on delete cascade,
  sender_id text not null references users(id) on delete cascade,
  message text not null,
  quick_type text,
  created_at timestamptz not null default now()
);

create table if not exists donor_locations (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references matches(id) on delete cascade,
  donor_id text not null references users(id) on delete cascade,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  eta_minutes integer,
  status text not null default 'on_the_way',
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_match_created
  on chat_messages (match_id, created_at);

create index if not exists idx_donor_locations_match_created
  on donor_locations (match_id, created_at desc);

create index if not exists idx_notifications_deliver_at
  on notifications (deliver_at);

create index if not exists idx_requests_schedule
  on blood_requests (request_type, scheduled_for);

create index if not exists idx_requests_matching_status
  on blood_requests (matching_status);

create index if not exists idx_matches_request_status_rank
  on matches (request_id, match_status, match_rank);

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'blood_requests_status_allowed'
  ) then
    alter table blood_requests
      drop constraint blood_requests_status_allowed;
  end if;

  alter table blood_requests
    add constraint blood_requests_status_allowed
    check (status in ('pending', 'verified', 'donor_matched', 'checked_in', 'blood_collected', 'fulfilled', 'cancelled'));

  if exists (
    select 1 from pg_constraint where conname = 'matches_match_status_check'
  ) then
    alter table matches
      drop constraint matches_match_status_check;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'matches_match_status_allowed'
  ) then
    alter table matches
      add constraint matches_match_status_allowed
      check (match_status in ('Candidate', 'Alerted', 'Accepted', 'Declined'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'blood_requests_request_type_allowed'
  ) then
    alter table blood_requests
      add constraint blood_requests_request_type_allowed
      check (request_type in ('Scheduled', 'Emergency'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'blood_requests_matching_status_allowed'
  ) then
    alter table blood_requests
      add constraint blood_requests_matching_status_allowed
      check (matching_status in ('pending', 'matched', 'sent', 'accepted', 'completed'));
  end if;
end $$;
