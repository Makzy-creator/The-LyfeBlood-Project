import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseAuthClient,
  createSupabaseServerClient,
  getSupabaseConfig,
} from '@/lib/supabase-server'
import { getBearerToken, getCanonicalRole } from '@/lib/auth-server'
import { createMatchesForRequest } from '@/lib/matching'
import { notifyRequestRecipients } from '@/lib/notifications-server'

const VALID_TIERS = ['Standard', 'Urgent', 'SOS']
const VALID_REQUEST_TYPES = ['Scheduled', 'Emergency']
const PROFILE_SELECT = 'id, email, role'

function notificationDeliveryFor(requestType: string, scheduledFor: string | null) {
  if (requestType !== 'Scheduled' || !scheduledFor) return new Date().toISOString()
  const deliverAt = new Date(scheduledFor).getTime() - 2 * 86_400_000
  return new Date(Math.max(Date.now(), deliverAt)).toISOString()
}

function normalizeBloodTypes(value: string | string[] | undefined) {
  const list = Array.isArray(value) ? value : [value]
  const seen = new Set<string>()
  const types: string[] = []
  for (const entry of list) {
    const type = typeof entry === 'string' ? entry.trim() : ''
    if (!type || seen.has(type)) continue
    seen.add(type)
    types.push(type)
  }
  return types.length ? types.join(', ') : null
}

function createUserSupabaseClient(request: NextRequest) {
  const token = getBearerToken(request as unknown as Request)
  const { url, anonKey } = getSupabaseConfig()

  if (!url || !anonKey || !token) {
    throw new Error('Supabase authenticated client configuration is missing')
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request as unknown as Request)
    if (!token) {
      return NextResponse.json({ error: 'Please sign in to create a request.' }, { status: 401 })
    }

    const authClient = createSupabaseAuthClient(request as unknown as Request)
    const { data: authData, error: authError } = await authClient.auth.getUser(token)
    if (authError || !authData?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to create a request.' }, { status: 401 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(PROFILE_SELECT)
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profile) {
      return NextResponse.json(
        {
          error: 'Your account profile is missing. Please complete your profile and try again.',
        },
        { status: 409 }
      )
    }

    const body = await request.json()
    const {
      hospital_name,
      blood_type_needed,
      urgency_tier,
      units_needed = 1,
      patient_ref,
      location,
      latitude,
      longitude,
      urgency_note,
      hospital_id,
      request_type = 'Emergency',
      scheduled_for,
    } = body

    if (!hospital_name?.trim()) {
      return NextResponse.json({ error: 'hospital_name is required' }, { status: 400 })
    }
    const normalizedBloodTypes = normalizeBloodTypes(blood_type_needed)
    if (!normalizedBloodTypes) {
      return NextResponse.json({ error: 'blood_type_needed is required' }, { status: 400 })
    }
    if (!VALID_TIERS.includes(urgency_tier)) {
      return NextResponse.json(
        { error: 'urgency_tier must be Standard, Urgent, or SOS' },
        { status: 400 }
      )
    }
    if (!VALID_REQUEST_TYPES.includes(request_type)) {
      return NextResponse.json(
        { error: 'request_type must be Scheduled or Emergency' },
        { status: 400 }
      )
    }

    const role = getCanonicalRole(profile.role)
    const unitCount = Number(units_needed)
    if (!Number.isInteger(unitCount) || unitCount < 1) {
      return NextResponse.json(
        { error: 'units_needed must be a positive integer' },
        { status: 400 }
      )
    }
    if (role === 'patient' && unitCount > 5) {
      return NextResponse.json({ error: 'Patient requests cannot exceed 5 pints' }, { status: 400 })
    }

    const scheduledForDate = scheduled_for ? new Date(scheduled_for) : null
    if (request_type === 'Scheduled') {
      if (!scheduledForDate || !Number.isFinite(scheduledForDate.getTime())) {
        return NextResponse.json(
          { error: 'scheduled_for is required for Scheduled requests' },
          { status: 400 }
        )
      }
      if (scheduledForDate.getTime() <= Date.now()) {
        return NextResponse.json({ error: 'scheduled_for must be in the future' }, { status: 400 })
      }
    }

    const scheduledForValue = request_type === 'Scheduled' ? scheduledForDate!.toISOString() : null

    const userSupabase = createUserSupabaseClient(request)
    const { data: bloodRequest, error: createError } = await userSupabase.rpc(
      'create_blood_request',
      {
        p_hospital_name: hospital_name.trim(),
        p_blood_type_needed: normalizedBloodTypes,
        p_urgency_tier: urgency_tier,
        p_units_needed: unitCount,
        p_patient_ref: patient_ref ?? null,
        p_location: location ?? null,
        p_latitude: latitude ?? null,
        p_longitude: longitude ?? null,
        p_urgency_note: urgency_note ?? null,
        p_hospital_id: role === 'admin' ? (hospital_id ?? null) : null,
        p_request_type: request_type,
        p_scheduled_for: scheduledForValue,
      }
    )

    if (createError) throw createError

    const deliverAt = notificationDeliveryFor(request_type, scheduledForValue)
    const sideEffectWarnings: string[] = []

    try {
      await notifyRequestRecipients(supabase, bloodRequest, {
        type: 'request_created',
        title: 'Blood request created',
        message: `${bloodRequest.blood_type_needed} request created at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        deliver_at: deliverAt,
      })
    } catch (error) {
      console.error('[POST /api/requests/create] notification side effect failed', error)
      sideEffectWarnings.push('request_created_notification_failed')
    }

    let matching: { inserted: number; skipped: boolean } = { inserted: 0, skipped: true }
    try {
      matching = await createMatchesForRequest(userSupabase, bloodRequest, {
        limit: role === 'patient' ? 4 : undefined,
        status: 'Candidate',
        notify: false,
      })
    } catch (error) {
      console.error('[POST /api/requests/create] matching side effect failed', error)
      sideEffectWarnings.push('matching_failed')
    }

    return NextResponse.json(
      {
        request: bloodRequest,
        matching,
        sideEffectWarnings,
        message: 'Request created',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/requests/create]', err)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
