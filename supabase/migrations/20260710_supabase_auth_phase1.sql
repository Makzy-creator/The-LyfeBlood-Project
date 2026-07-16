-- Phase 1: Supabase Auth profile mapping and minimal profile RLS.
-- Safe to rerun on Supabase/Postgres.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    full_name,
    email,
    phone,
    role,
    blood_type,
    location,
    availability_status,
    is_verified,
    created_at
  )
  values (
    new.id::text,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    lower(new.email),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'donor'),
    new.raw_user_meta_data->>'blood_type',
    new.raw_user_meta_data->>'location',
    coalesce((new.raw_user_meta_data->>'availability_status')::integer, 0),
    coalesce((new.raw_user_meta_data->>'is_verified')::integer, 0),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role,
    blood_type = excluded.blood_type,
    location = excluded.location;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

alter table public.users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users_select_own_profile'
  ) then
    create policy users_select_own_profile
      on public.users
      for select
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users_update_own_profile'
  ) then
    create policy users_update_own_profile
      on public.users
      for update
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end $$;

grant select on public.users to authenticated;
revoke update on public.users from authenticated;
grant update (
  full_name,
  phone,
  blood_type,
  location,
  availability_status
) on public.users to authenticated;
