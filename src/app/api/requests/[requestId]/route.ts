import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCanonicalRole, requireAuth } from '@/lib/auth-server'

const DELETE_AFTER_MS = 24 * 60 * 60 * 1000
const REQUEST_TYPES_BY_DONOR: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
  AB: ['AB-', 'AB+'],
}

async function donorHasAssignedMatch(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  requestId: string,
  donorId: string
) {
  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .eq('request_id', requestId)
    .eq('donor_id', donorId)
    .neq('match_status', 'Declined')
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

async function donorCanReadCompatibleRequest(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  bloodRequest: Record<string, unknown>,
  donorId: string
) {
  if (['fulfilled', 'cancelled', 'Completed', 'Cancelled'].includes(bloodRequest.status as string))
    return false

  const { data: donor, error } = await supabase
    .from('users')
    .select('blood_type')
    .eq('id', donorId)
    .maybeSingle()

  if (error) throw error

  const compatibleRequestTypes = REQUEST_TYPES_BY_DONOR[donor?.blood_type] ?? []
  return compatibleRequestTypes.includes(bloodRequest.blood_type_needed as string)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const auth = await requireAuth(request as unknown as Request, [
      'patient',
      'donor',
      'hospital_staff',
      'admin',
    ])
    if (auth.error) return auth.error

    const { requestId } = await params
    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: bloodRequest, error } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle()

    if (error) throw error
    if (!bloodRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const role = getCanonicalRole(auth.user!.role)
    let authorized =
      role === 'admin' ||
      bloodRequest.requested_by === auth.user!.sub ||
      bloodRequest.hospital_id === auth.user!.sub

    if (!authorized && role === 'donor') {
      authorized =
        (await donorHasAssignedMatch(supabase, requestId, auth.user!.sub)) ||
        (await donorCanReadCompatibleRequest(supabase, bloodRequest, auth.user!.sub))
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ request: bloodRequest })
  } catch (err) {
    console.error('[GET /api/requests/:id]', err)
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const auth = await requireAuth(request as unknown as Request, [
      'patient',
      'hospital_staff',
      'admin',
    ])
    if (auth.error) return auth.error

    const { requestId } = await params
    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: bloodRequest, error: lookupError } = await supabase
      .from('blood_requests')
      .select('id, requested_by, hospital_id, created_at')
      .eq('id', requestId)
      .maybeSingle()

    if (lookupError) throw lookupError
    if (!bloodRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const role = getCanonicalRole(auth.user!.role)
    const authorized =
      role === 'admin' ||
      bloodRequest.requested_by === auth.user!.sub ||
      bloodRequest.hospital_id === auth.user!.sub

    if (!authorized) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const createdAt = new Date(bloodRequest.created_at).getTime()
    if (!Number.isFinite(createdAt) || Date.now() - createdAt < DELETE_AFTER_MS) {
      return NextResponse.json(
        { error: 'Requests can only be deleted after 24 hours' },
        { status: 409 }
      )
    }

    const { error: notificationDeleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('request_id', requestId)

    if (notificationDeleteError) throw notificationDeleteError

    const { error: matchDeleteError } = await supabase
      .from('matches')
      .delete()
      .eq('request_id', requestId)

    if (matchDeleteError) throw matchDeleteError

    const { error: requestDeleteError } = await supabase
      .from('blood_requests')
      .delete()
      .eq('id', requestId)

    if (requestDeleteError) throw requestDeleteError

    return NextResponse.json({ message: 'Request deleted' })
  } catch (err) {
    console.error('[DELETE /api/requests/:id]', err)
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}
