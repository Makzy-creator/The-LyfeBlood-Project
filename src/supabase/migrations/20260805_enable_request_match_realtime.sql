-- Publish request and match state changes for authenticated dashboard subscriptions.
-- Idempotent so it is safe to apply to projects where either table is already published.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'blood_requests'
  ) then
    alter publication supabase_realtime add table public.blood_requests;
  end if;
end
$$;
