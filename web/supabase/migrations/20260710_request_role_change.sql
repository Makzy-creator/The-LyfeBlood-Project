-- Phase 2: profile role-change requests.
-- Users can request a role change without updating public.users.role directly.

create table if not exists public.role_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  from_role text not null,
  requested_role text not null check (requested_role in ('donor', 'requester', 'hospital')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null,
  constraint role_change_requests_different_role check (from_role <> requested_role)
);

create unique index if not exists role_change_requests_one_pending_per_user
  on public.role_change_requests (user_id)
  where status = 'pending';

alter table public.role_change_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'role_change_requests'
      and policyname = 'role_change_requests_select_own'
  ) then
    create policy role_change_requests_select_own
      on public.role_change_requests
      for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'role_change_requests'
      and policyname = 'role_change_requests_admin_manage'
  ) then
    create policy role_change_requests_admin_manage
      on public.role_change_requests
      for all
      using (
        exists (
          select 1
          from public.users
          where id = auth.uid()
            and role = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.users
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;
end $$;

create or replace function public.request_role_change(target_role text)
returns public.role_change_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
  existing_role text;
  normalized_role text := lower(trim(target_role));
  submitted_request public.role_change_requests;
begin
  if requester_id is null then
    raise exception 'Authentication required';
  end if;

  if normalized_role not in ('donor', 'requester', 'hospital') then
    raise exception 'requested_role must be donor, requester, or hospital';
  end if;

  select role
    into existing_role
  from public.users
  where id = requester_id;

  if existing_role is null then
    raise exception 'User not found';
  end if;

  if existing_role = normalized_role then
    raise exception 'Requested role matches current role';
  end if;

  insert into public.role_change_requests (
    user_id,
    from_role,
    requested_role,
    status,
    requested_at
  )
  values (
    requester_id,
    existing_role,
    normalized_role,
    'pending',
    now()
  )
  on conflict (user_id) where status = 'pending'
  do update set
    from_role = excluded.from_role,
    requested_role = excluded.requested_role,
    requested_at = now()
  returning * into submitted_request;

  return submitted_request;
end;
$$;

revoke all on public.role_change_requests from anon;
grant select on public.role_change_requests to authenticated;

revoke all on function public.request_role_change(text) from public;
grant execute on function public.request_role_change(text) to authenticated;
