-- Persist role-specific registration fields that do not belong in the common profile columns.
alter table public.users
  add column if not exists registration_details jsonb not null default '{}'::jsonb;

comment on column public.users.registration_details is
  'Role-specific signup data such as requester patient context or hospital facility details.';

-- Extend the auth-user trigger so profile creation and retries preserve these details.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role text;
begin
  profile_role := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'donor');
  if profile_role not in ('donor', 'requester', 'hospital') then
    profile_role := 'donor';
  end if;

  insert into public.users (
    id, full_name, email, phone, role, blood_type, location,
    registration_details, availability_status, is_verified, created_at
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email),
    lower(new.email),
    nullif(new.raw_user_meta_data->>'phone', ''),
    profile_role,
    nullif(new.raw_user_meta_data->>'blood_type', ''),
    nullif(new.raw_user_meta_data->>'location', ''),
    coalesce(new.raw_user_meta_data->'registration_details', '{}'::jsonb),
    0, 0, now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role,
    blood_type = excluded.blood_type,
    location = excluded.location,
    registration_details = excluded.registration_details;

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
