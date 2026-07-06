-- Persistent user notifications.
-- Safe to rerun on Supabase/Postgres.

create extension if not exists pgcrypto;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  request_id text references blood_requests(id) on delete cascade,
  match_id text references matches(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created
  on notifications (user_id, created_at desc);

create index if not exists idx_notifications_user_unread
  on notifications (user_id, read_at)
  where read_at is null;

create index if not exists idx_notifications_request
  on notifications (request_id);

create index if not exists idx_notifications_match
  on notifications (match_id);
