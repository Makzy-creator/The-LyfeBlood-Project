-- Reconcile the production blood_requests table with the request-creation RPC.
-- Existing rows using the legacy `active` status are intentionally preserved.

alter table public.blood_requests
  add column if not exists units_fulfilled integer not null default 0,
  add column if not exists request_type text not null default 'Emergency',
  add column if not exists scheduled_for timestamptz;

alter table public.blood_requests
  alter column status set default 'pending';

do $$
declare
  constraint_name text;
begin
  -- Replace only CHECK constraints that directly constrain the status column.
  -- The compatibility value `active` keeps legacy rows valid.
  for constraint_name in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.blood_requests'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ~ '\mstatus\M'
  loop
    execute format(
      'alter table public.blood_requests drop constraint %I',
      constraint_name
    );
  end loop;

  alter table public.blood_requests
    add constraint blood_requests_status_allowed
    check (
      status in (
        'active',
        'pending',
        'verified',
        'donor_matched',
        'checked_in',
        'blood_collected',
        'fulfilled',
        'cancelled'
      )
    );

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.blood_requests'::regclass
      and conname = 'blood_requests_request_type_allowed'
  ) then
    alter table public.blood_requests
      add constraint blood_requests_request_type_allowed
      check (request_type in ('Scheduled', 'Emergency'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.blood_requests'::regclass
      and conname = 'blood_requests_units_fulfilled_nonnegative'
  ) then
    alter table public.blood_requests
      add constraint blood_requests_units_fulfilled_nonnegative
      check (units_fulfilled >= 0);
  end if;
end $$;

create index if not exists idx_requests_schedule
  on public.blood_requests (request_type, scheduled_for);

create or replace function public.normalize_blood_types(p_blood_types text)
returns text[]
language sql
immutable
set search_path = public
as $$
  with raw_blood_types as (
    select trim(input.value) as blood_type, input.ordinal
    from unnest(string_to_array(coalesce(p_blood_types, ''), ','))
      with ordinality as input(value, ordinal)
  ),
  valid_blood_types as (
    select *
    from (values
      ('A+'), ('A-'), ('B+'), ('B-'), ('O+'), ('O-'), ('AB+'), ('AB-')
    ) as allowed(blood_type)
  ),
  unique_blood_types as (
    select raw_blood_types.blood_type, min(raw_blood_types.ordinal) as ordinal
    from raw_blood_types
    join valid_blood_types using (blood_type)
    group by raw_blood_types.blood_type
  )
  select coalesce(array_agg(blood_type order by ordinal), array[]::text[])
  from unique_blood_types;
$$;

create or replace function public.request_blood_type_matches(
  p_request_blood_types text,
  p_donor_blood_type text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select exists (
    select 1
    from unnest(public.normalize_blood_types(p_request_blood_types)) as requested(blood_type)
    where
      (requested.blood_type = 'O-' and p_donor_blood_type in ('O-'))
      or (requested.blood_type = 'O+' and p_donor_blood_type in ('O-', 'O+'))
      or (requested.blood_type = 'A-' and p_donor_blood_type in ('O-', 'A-'))
      or (requested.blood_type = 'A+' and p_donor_blood_type in ('O-', 'O+', 'A-', 'A+'))
      or (requested.blood_type = 'B-' and p_donor_blood_type in ('O-', 'B-'))
      or (requested.blood_type = 'B+' and p_donor_blood_type in ('O-', 'O+', 'B-', 'B+'))
      or (requested.blood_type = 'AB-' and p_donor_blood_type in ('O-', 'A-', 'B-', 'AB-'))
      or (
        requested.blood_type = 'AB+'
        and p_donor_blood_type in ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+')
      )
  );
$$;

grant execute on function public.normalize_blood_types(text) to authenticated;
grant execute on function public.request_blood_type_matches(text, text) to authenticated;

create or replace function public.create_blood_request(
  p_hospital_name text,
  p_blood_type_needed text,
  p_urgency_tier text,
  p_units_needed integer default 1,
  p_patient_ref text default null,
  p_location text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_urgency_note text default null,
  p_hospital_id uuid default null,
  p_request_type text default 'Emergency',
  p_scheduled_for timestamptz default null
)
returns public.blood_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
  requester_role text;
  assigned_hospital_id uuid := null;
  created_request public.blood_requests;
  requested_blood_types text[] := public.normalize_blood_types(p_blood_type_needed);
  serialized_blood_types text := array_to_string(
    public.normalize_blood_types(p_blood_type_needed),
    ', '
  );
begin
  if requester_id is null then
    raise exception 'Authentication required';
  end if;

  select role,
         case
           when role in ('hospital', 'hospital_officer', 'hospital_staff') then hospital_id
           else null
         end
    into requester_role, assigned_hospital_id
  from public.users
  where id::text = requester_id::text;

  if requester_role is null then
    raise exception 'User not found';
  end if;

  if requester_role not in (
    'requester',
    'patient_family',
    'patient',
    'hospital',
    'hospital_officer',
    'hospital_staff',
    'admin'
  ) then
    raise exception 'Only patients, hospitals, or admins can create requests';
  end if;

  if nullif(trim(p_hospital_name), '') is null then
    raise exception 'hospital_name is required';
  end if;

  if coalesce(cardinality(requested_blood_types), 0) = 0 then
    raise exception 'blood_type_needed is required';
  end if;

  if requester_role in ('requester', 'patient_family', 'patient')
    and cardinality(requested_blood_types) > 1 then
    raise exception 'Patient requests can include only one blood type';
  end if;

  if p_urgency_tier not in ('Standard', 'Urgent', 'SOS') then
    raise exception 'urgency_tier must be Standard, Urgent, or SOS';
  end if;

  if p_request_type not in ('Scheduled', 'Emergency') then
    raise exception 'request_type must be Scheduled or Emergency';
  end if;

  if p_units_needed is null or p_units_needed < 1 then
    raise exception 'units_needed must be a positive integer';
  end if;

  if requester_role in ('requester', 'patient_family', 'patient')
    and p_units_needed > 5 then
    raise exception 'Patient requests cannot exceed 5 pints';
  end if;

  if p_request_type = 'Scheduled' then
    if p_scheduled_for is null then
      raise exception 'scheduled_for is required for Scheduled requests';
    end if;

    if p_scheduled_for <= now() then
      raise exception 'scheduled_for must be in the future';
    end if;
  end if;

  if requester_role = 'admin' then
    assigned_hospital_id := p_hospital_id;
  end if;

  insert into public.blood_requests (
    hospital_name,
    patient_ref,
    blood_type_needed,
    urgency_tier,
    location,
    latitude,
    longitude,
    requested_by,
    hospital_id,
    units_needed,
    urgency_note,
    units_fulfilled,
    status,
    request_type,
    scheduled_for,
    matching_status
  )
  values (
    trim(p_hospital_name),
    nullif(trim(p_patient_ref), ''),
    serialized_blood_types,
    p_urgency_tier,
    nullif(trim(p_location), ''),
    p_latitude,
    p_longitude,
    requester_id,
    assigned_hospital_id,
    p_units_needed,
    nullif(trim(p_urgency_note), ''),
    0,
    'pending',
    p_request_type,
    case when p_request_type = 'Scheduled' then p_scheduled_for else null end,
    'pending'
  )
  returning * into created_request;

  return created_request;
end;
$$;

revoke all on function public.create_blood_request(
  text,
  text,
  text,
  integer,
  text,
  text,
  double precision,
  double precision,
  text,
  uuid,
  text,
  timestamptz
) from public;

grant execute on function public.create_blood_request(
  text,
  text,
  text,
  integer,
  text,
  text,
  double precision,
  double precision,
  text,
  uuid,
  text,
  timestamptz
) to authenticated;
