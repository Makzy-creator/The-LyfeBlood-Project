import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken, requireAuth } from '@/lib/auth-server'
import { createNotifications, requestRecipientIds } from '@/lib/notifications-server'
import { createSupabaseServerClient, getSupabaseConfig } from '@/lib/supabase-server'

interface ActionConfig {
  matchField: string
  requestStatus: string
  message: string
  notificationTitle: string
}

const ACTIONS: Record<string, ActionConfig> = {
  arrived: {
    matchField: 'arrived_at',
    requestStatus: 'checked_in',
    message: 'Donor marked as arrived.',
    notificationTitle: 'Donor arrived',
  },
  blood_collected: {
    matchField: 'blood_collected_at',
    requestStatus: 'blood_collected',
    message: 'Blood collection recorded.',
    notificationTitle: 'Blood collected',
  },
  donation_completed: {
    matchField: 'donation_completed_at',
    requestStatus: 'fulfilled',
    message: 'Donation completed.',
    notificationTitle: 'Donation completed',
  },
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

function rpcErrorResponse(error: { message?: string }) {
  const message = error?.message ?? 'Failed to update hospital match status'
  if (message.includes('not found')) {
    return NextResponse.json({ error: message }, { status: 404 })
  }
  if (message.includes('Forbidden')) {
    return NextResponse.json({ error: message }, { status: 403 })
  }
  if (
    message.includes('Only accepted') ||
    message.includes('before') ||
    message.includes('already')
  ) {
    return NextResponse.json({ error: message }, { status: 409 })
  }
  return NextResponse.json({ error: 'Failed to update hospital match status' }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, ['hospital_staff', 'admin'])
    if (auth.error) return auth.error

    const body = await request.json()
    const matchId = body.match_id
    const action = ACTIONS[body.action]

    if (!matchId) {
      return NextResponse.json({ error: 'match_id is required' }, { status: 400 })
    }
    if (!action) {
      return NextResponse.json(
        { error: 'action must be arrived, blood_collected, or donation_completed' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const userSupabase = createUserSupabaseClient(request)
    const { data: result, error } = await userSupabase.rpc('mark_hospital_status', {
      p_match_id: matchId,
      p_action: body.action,
    })

    if (error) throw error

    const updatedMatch = result?.match
    const updatedRequest = result?.request
    const nextRequestStatus = result?.new_status
    const bloodRequest = updatedRequest
    const match = updatedMatch

    const recipients = [...requestRecipientIds(bloodRequest), match.donor_id]
    await createNotifications(
      supabase,
      [...new Set(recipients.filter(Boolean))].map((userId) => ({
        user_id: userId,
        type: 'hospital_status_update',
        title: action.notificationTitle,
        message: `${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name} is now ${nextRequestStatus.replaceAll('_', ' ')}.`,
        request_id: match.request_id,
        match_id: match.id,
      }))
    )

    return NextResponse.json({
      message: action.message,
      match: updatedMatch,
      request: updatedRequest,
      new_status: nextRequestStatus,
      verified_by: auth.user!.sub,
    })
  } catch (err) {
    console.error('[POST /api/matches/hospital-status]', err)
    return rpcErrorResponse(err as { message?: string })
  }
}
