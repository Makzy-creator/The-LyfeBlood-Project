-- Secure OTP check-in audit fields.
-- Safe to rerun on Supabase/Postgres.

alter table verification_tokens
  add column if not exists used_at timestamptz,
  add column if not exists checked_in_at timestamptz,
  add column if not exists verified_by text references users(id) on delete set null;

create index if not exists idx_tokens_verified_by
  on verification_tokens (verified_by);

create index if not exists idx_tokens_checked_in_at
  on verification_tokens (checked_in_at);
