-- Phase 3: safe direct reads for blood requests.

alter table public.blood_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blood_requests'
      and policyname = 'blood_requests_select_own_patient'
  ) then
    create policy blood_requests_select_own_patient
      on public.blood_requests
      for select
      using (requested_by::text = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blood_requests'
      and policyname = 'blood_requests_select_own_hospital'
  ) then
    create policy blood_requests_select_own_hospital
      on public.blood_requests
      for select
      using (
        exists (
          select 1
          from public.users
          where id::text = auth.uid()::text
            and role in ('hospital', 'hospital_officer')
        )
        and (
          requested_by::text = auth.uid()::text
          or hospital_id::text = auth.uid()::text
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blood_requests'
      and policyname = 'blood_requests_select_compatible_donor'
  ) then
    create policy blood_requests_select_compatible_donor
      on public.blood_requests
      for select
      using (
        status not in ('fulfilled', 'cancelled', 'Completed', 'Cancelled')
        and exists (
          select 1
          from public.users
          where id::text = auth.uid()::text
            and role = 'donor'
            and (
              (blood_type = 'O-' and blood_type_needed in ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'))
              or (blood_type = 'O+' and blood_type_needed in ('O+', 'A+', 'B+', 'AB+'))
              or (blood_type = 'A-' and blood_type_needed in ('A-', 'A+', 'AB-', 'AB+'))
              or (blood_type = 'A+' and blood_type_needed in ('A+', 'AB+'))
              or (blood_type = 'B-' and blood_type_needed in ('B-', 'B+', 'AB-', 'AB+'))
              or (blood_type = 'B+' and blood_type_needed in ('B+', 'AB+'))
              or (blood_type = 'AB-' and blood_type_needed in ('AB-', 'AB+'))
              or (blood_type = 'AB+' and blood_type_needed = 'AB+')
              or (blood_type = 'AB' and blood_type_needed in ('AB-', 'AB+'))
            )
        )
      );
  end if;
end $$;

grant select on public.blood_requests to authenticated;
