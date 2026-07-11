-- Fix profile RLS comparisons for projects where public.users.id is text.
-- Safe for uuid-backed tables too because both sides are compared as text.

drop policy if exists users_select_own_profile on public.users;
drop policy if exists users_update_own_profile on public.users;

create policy users_select_own_profile
  on public.users
  for select
  using (id::text = auth.uid()::text);

create policy users_update_own_profile
  on public.users
  for update
  using (id::text = auth.uid()::text)
  with check (id::text = auth.uid()::text);
