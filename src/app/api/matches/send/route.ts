import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCanonicalRole, requireAuth } from '@/lib/auth-server'
import { createNotifications, requestRecipientIds } from '@/lib/notifications-server'

function deliveryForRequest(bloodRequest: Record<string, unknown> | null) {
  if (bloodRequest?.request_type !== 'Scheduled' || !bloodRequest?.scheduled_for) {
    return new Date().toISOString()
  }
  const deliverAt = new Date(bloodRequest.scheduled_for as string).getTime() - 2 * 86_400_000
  return new Date(Math.max(Date.now(), deliverAt)).toISOString()
}

function canOwnRequest(role: string, userId: string, bloodRequest: Record<string, unknown> | null) {
  return (
    role === 'admin' ||
    bloodRequest?.requested_by === userId ||
    bloodRequest?.hospital_id === userId
  )
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, [
      'patient',
      'hospital_staff',
      'admin',
    ])
    if (auth.error) return auth.error

    const body = await request.json()
    const requestId = body.request_id
    const matchIds: string[] = Array.isArray(body.match_ids)
      ? [...new Set(body.match_ids.filter(Boolean))]
      : []

    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }
    if (!matchIds.length) {
      return NextResponse.json({ error: 'match_ids is required' }, { status: 400 })
    }

    const role = getCanonicalRole(auth.user!.role)
    if (role === 'patient' && matchIds.length > 4) {
      return NextResponse.json(
        { error: 'Patient requests can be sent to at most 4 donors' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: bloodRequest, error: requestError } = await supabase
      .from('blood_requests')
      .select(
        'id, hospital_name, blood_type_needed, requested_by, hospital_id, request_type, scheduled_for'
      )
      .eq('id', requestId)
      .maybeSingle()

    if (requestError) throw requestError
    if (!bloodRequest || !canOwnRequest(role, auth.user!.sub, bloodRequest)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, donor_id, match_status, request_id')
      .eq('request_id', requestId)
      .in('id', matchIds)

    if (matchError) throw matchError
    if ((matches ?? []).length !== matchIds.length) {
      return NextResponse.json({ error: 'One or more matches were not found' }, { status: 404 })
    }

    const invalidMatch = (matches ?? []).find(
      (match: { match_status: string }) => match.match_status !== 'Candidate'
    )
    if (invalidMatch) {
      return NextResponse.json(
        { error: 'Only candidate matches can be sent to donors' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        match_status: 'Alerted',
        selected_at: now,
        notified_at: now,
      })
      .in('id', matchIds)
      .eq('request_id', requestId)

    if (updateError) throw updateError

    const deliverAt = deliveryForRequest(bloodRequest)
    await createNotifications(supabase, [
      ...(matches ?? []).map((match: { id: string; donor_id: string }) => ({
        user_id: match.donor_id,
        type: 'donor_matched',
        title: 'New donor request',
        message: `${bloodRequest.blood_type_needed} needed at ${bloodRequest.hospital_name}.`,
        request_id: requestId,
        match_id: match.id,
        deliver_at: deliverAt,
      })),
      ...requestRecipientIds(bloodRequest as Record<string, string | null | undefined>).map(
        (userId) => ({
          user_id: userId,
          type: 'donor_matched',
          title: 'Donor requests sent',
          message: `${matches!.length} donor request${matches!.length === 1 ? '' : 's'} sent for ${bloodRequest.blood_type_needed}.`,
          request_id: requestId,
          deliver_at: deliverAt,
        })
      ),
    ])

    await supabase.from('blood_requests').update({ matching_status: 'sent' }).eq('id', requestId)

    return NextResponse.json({
      message: 'Requests sent to selected donors',
      request_id: requestId,
      sent_count: matches!.length,
    })
  } catch (err) {
    console.error('[POST /api/matches/send]', err)
    return NextResponse.json({ error: 'Failed to send donor requests' }, { status: 500 })
  }
}
