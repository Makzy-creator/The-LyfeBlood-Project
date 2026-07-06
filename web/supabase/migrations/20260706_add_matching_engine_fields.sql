-- Production matching engine support fields.
-- Safe to rerun on Supabase/Postgres.

alter table users
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists last_donation_at timestamptz,
  add column if not exists is_suspended boolean not null default false,
  add column if not exists is_inactive boolean not null default false,
  add column if not exists matching_opt_out boolean not null default false;

alter table blood_requests
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists hospital_id text references users(id) on delete set null;

alter table matches
  add column if not exists distance_km double precision,
  add column if not exists match_rank integer,
  add column if not exists notified_at timestamptz,
  add column if not exists responded_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_latitude_range'
  ) then
    alter table users
      add constraint users_latitude_range
      check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'users_longitude_range'
  ) then
    alter table users
      add constraint users_longitude_range
      check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'blood_requests_latitude_range'
  ) then
    alter table blood_requests
      add constraint blood_requests_latitude_range
      check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'blood_requests_longitude_range'
  ) then
    alter table blood_requests
      add constraint blood_requests_longitude_range
      check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'matches_distance_km_nonnegative'
  ) then
    alter table matches
      add constraint matches_distance_km_nonnegative
      check (distance_km is null or distance_km >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'matches_rank_positive'
  ) then
    alter table matches
      add constraint matches_rank_positive
      check (match_rank is null or match_rank > 0);
  end if;
end $$;

create unique index if not exists idx_matches_unique_request_donor
  on matches (request_id, donor_id);

create index if not exists idx_users_matching_eligibility
  on users (
    role,
    blood_type,
    availability_status,
    is_verified,
    is_suspended,
    is_inactive,
    matching_opt_out
  );

create index if not exists idx_users_matching_location
  on users (latitude, longitude)
  where role = 'donor';

create index if not exists idx_requests_matching_location
  on blood_requests (latitude, longitude);

create index if not exists idx_requests_hospital_id
  on blood_requests (hospital_id);

create index if not exists idx_matches_request_rank
  on matches (request_id, match_rank);

create index if not exists idx_matches_notified_at
  on matches (notified_at);
