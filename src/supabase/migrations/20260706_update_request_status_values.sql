-- Canonical production request statuses.
-- Safe to rerun on Supabase/Postgres.

update blood_requests
set status = case status
  when 'Pending' then 'pending'
  when 'Donor Matched' then 'donor_matched'
  when 'Arrived' then 'checked_in'
  when 'Arrived At Lab' then 'checked_in'
  when 'Completed' then 'fulfilled'
  else status
end
where status in ('Pending', 'Donor Matched', 'Arrived', 'Arrived At Lab', 'Completed');

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'blood_requests_status_check'
  ) then
    alter table blood_requests
      drop constraint blood_requests_status_check;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'blood_requests_status_allowed'
  ) then
    alter table blood_requests
      add constraint blood_requests_status_allowed
      check (status in ('pending', 'verified', 'donor_matched', 'checked_in', 'fulfilled', 'cancelled'));
  end if;
end $$;
