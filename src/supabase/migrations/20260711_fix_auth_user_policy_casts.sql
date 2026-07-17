-- Harden signup profile creation and profile RLS.
-- Safe for projects where public.users.id is either text or uuid.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  users_id_type text;
  profile_role text;
begin
  profile_role := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'donor');

  if profile_role in ('patient', 'patient_family') then
    profile_role := 'requester';
  end if;

  if profile_role not in ('donor', 'requester', 'hospital') then
    profile_role := 'donor';
  end if;

  select udt_name
    into users_id_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'users'
    and column_name = 'id';

  if users_id_type = 'uuid' then
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
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email),
      lower(new.email),
      nullif(new.raw_user_meta_data->>'phone', ''),
      profile_role,
      nullif(new.raw_user_meta_data->>'blood_type', ''),
      nullif(new.raw_user_meta_data->>'location', ''),
      0,
      0,
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
  else
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
      coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email),
      lower(new.email),
      nullif(new.raw_user_meta_data->>'phone', ''),
      profile_role,
      nullif(new.raw_user_meta_data->>'blood_type', ''),
      nullif(new.raw_user_meta_data->>'location', ''),
      0,
      0,
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
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_auth_user skipped profile for auth user %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

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
