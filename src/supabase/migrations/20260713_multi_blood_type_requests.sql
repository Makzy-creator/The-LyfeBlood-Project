-- Support multiple blood types in a request without changing blood_requests schema.
-- blood_requests.blood_type_needed remains scalar text; multi-type requests are stored
-- as a deduplicated comma-separated value such as 'O+, A-'.

create or replace function public.normalize_blood_types(p_blood_types text)
returns text[]
language sql
immutable
as $$
  with raw_blood_types as (
    select trim(input.value) as blood_type, input.ordinal
    from unnest(string_to_array(coalesce(p_blood_types, ''), ',')) with ordinality as input(value, ordinal)
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
      or (requested.blood_type = 'AB+' and p_donor_blood_type in ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'))
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
  serialized_blood_types text := array_to_string(public.normalize_blood_types(p_blood_type_needed), ', ');
begin
  if requester_id is null then
    raise exception 'Authentication required';
  end if;

  select role
    into requester_role
  from public.users
  where id = requester_id;

  if requester_role is null then
    raise exception 'User not found';
  end if;

  if requester_role not in ('requester', 'patient_family', 'patient', 'hospital', 'hospital_officer', 'hospital_staff', 'admin') then
    raise exception 'Only patients, hospitals, or admins can create requests';
  end if;

  if nullif(trim(p_hospital_name), '') is null then
    raise exception 'hospital_name is required';
  end if;

  if coalesce(cardinality(requested_blood_types), 0) = 0 then
    raise exception 'blood_type_needed is required';
  end if;

  if requester_role in ('requester', 'patient_family', 'patient') and cardinality(requested_blood_types) > 1 then
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

  if requester_role in ('requester', 'patient_family', 'patient') and p_units_needed > 5 then
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

  if requester_role in ('hospital', 'hospital_officer', 'hospital_staff') then
    assigned_hospital_id := requester_id;
  elsif requester_role = 'admin' then
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

create or replace function public.create_matches_for_request(
  p_request_id text,
  p_limit integer default null,
  p_status text default 'Candidate'
)
returns table(inserted integer, skipped boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.blood_requests;
  effective_limit integer;
begin
  select *
    into request_row
  from public.blood_requests
  where id::text = p_request_id;

  if request_row.id is null then
    return query select 0, true;
    return;
  end if;

  if coalesce(cardinality(public.normalize_blood_types(request_row.blood_type_needed)), 0) = 0 then
    return query select 0, true;
    return;
  end if;

  effective_limit := coalesce(
    p_limit,
    case
      when request_row.urgency_tier = 'SOS' then 50
      when request_row.urgency_tier = 'Urgent' then 25
      else 10
    end
  );

  with compatible_donors as (
    select
      u.id as donor_id,
      case
        when request_row.latitude is null
          or request_row.longitude is null
          or u.latitude is null
          or u.longitude is null
        then null
        else round(
          (
            6371 * 2 * asin(
              sqrt(
                power(sin(radians((u.latitude - request_row.latitude) / 2)), 2)
                + cos(radians(request_row.latitude))
                * cos(radians(u.latitude))
                * power(sin(radians((u.longitude - request_row.longitude) / 2)), 2)
              )
            )
          )::numeric,
          2
        )::double precision
      end as distance_km
    from public.users u
    where u.role = 'donor'
      and u.availability_status = 1
      and u.is_verified = 1
      and coalesce(u.is_suspended, false) = false
      and coalesce(u.is_inactive, false) = false
      and coalesce(u.matching_opt_out, false) = false
      and public.request_blood_type_matches(request_row.blood_type_needed, u.blood_type)
      and (
        u.last_donation_at is null
        or u.last_donation_at <= now() - interval '56 days'
      )
  ),
  ranked_donors as (
    select
      donor_id,
      distance_km,
      row_number() over (order by distance_km nulls last) as match_rank
    from compatible_donors
    limit effective_limit
  ),
  inserted_matches as (
    insert into public.matches (
      request_id,
      donor_id,
      match_status,
      distance_km,
      match_rank,
      notified_at
    )
    select
      request_row.id,
      donor_id,
      p_status,
      distance_km,
      match_rank,
      case when p_status = 'Alerted' then now() else null end
    from ranked_donors
    on conflict (request_id, donor_id) do nothing
    returning id
  ),
  match_count as (
    select count(*)::integer as inserted_count from inserted_matches
  )
  update public.blood_requests
    set matching_status = case
      when match_count.inserted_count > 0 then 'matched'
      else matching_status
    end
  from match_count
  where public.blood_requests.id = request_row.id
  returning match_count.inserted_count
  into inserted;

  return query select coalesce(inserted, 0), false;
end;
$$;

drop policy if exists blood_requests_select_compatible_donor on public.blood_requests;

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
        and public.request_blood_type_matches(blood_type_needed, blood_type)
    )
  );

revoke all on function public.create_blood_request(
  text, text, text, integer, text, text, double precision, double precision, text, uuid, text, timestamptz
) from public;
grant execute on function public.create_blood_request(
  text, text, text, integer, text, text, double precision, double precision, text, uuid, text, timestamptz
) to authenticated;

revoke all on function public.create_matches_for_request(text, integer, text) from public;
grant execute on function public.create_matches_for_request(text, integer, text) to authenticated;
