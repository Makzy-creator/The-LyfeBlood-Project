import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseConfig } from '@/lib/supabase-server'
import { getBearerToken, requireAuth } from '@/lib/auth-server'
import { generateOtp, getOtpTtlMinutes, getOtpTtlSeconds, hashOtp } from '@/lib/otp-server'
import { createNotifications, requestRecipientIds } from '@/lib/notifications-server'

function minutesFromNow(n: number) {
  return new Date(Date.now() + n * 60_000).toISOString()
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
  const message = error?.message ?? 'Failed to update match'
  if (message.includes('not found')) {
    return NextResponse.json({ error: message }, { status: 404 })
  }
  if (message.includes('already') || message.includes('cooldown')) {
    return NextResponse.json({ error: message }, { status: 409 })
  }
  if (
    message.includes('not currently available') ||
    message.includes('not verified') ||
    message.includes('suspended') ||
    message.includes('inactive') ||
    message.includes('opted out')
  ) {
    return NextResponse.json({ error: message }, { status: 403 })
  }
  return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, ['donor'])
    if (auth.error) return auth.error

    const body = await request.json()
    const { request_id, decision } = body

    if (!request_id) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }
    if (!['Accepted', 'Declined'].includes(decision)) {
      return NextResponse.json({ error: 'decision must be Accepted or Declined' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)

    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, request_id, donor_id, match_status')
      .eq('donor_id', auth.user!.sub)
      .eq('request_id', request_id)
      .limit(1)

    if (matchError) throw matchError

    const match = matches?.[0]
    if (!match) {
      return NextResponse.json(
        { error: 'Request not found or not assigned to this donor' },
        { status: 404 }
      )
    }

    if (['Accepted', 'Declined'].includes(match.match_status)) {
      return NextResponse.json({ error: 'Match already responded to' }, { status: 409 })
    }

    const match_id = match.id
    const userSupabase = createUserSupabaseClient(request)

    if (decision === 'Declined') {
      const { data: result, error } = await userSupabase.rpc('respond_to_match', {
        p_match_id: match_id,
        p_decision: decision,
        p_secure_otp: null,
        p_expires_at: null,
      })

      if (error) throw error

      const bloodRequest = result?.request

      await createNotifications(supabase, [
        {
          user_id: auth.user!.sub,
          type: 'match_declined',
          title: 'Match declined',
          message: `You declined the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
          request_id: bloodRequest.id,
          match_id,
        },
        ...requestRecipientIds(bloodRequest).map((userId) => ({
          user_id: userId,
          type: 'match_declined',
          title: 'Donor declined',
          message: `A donor declined the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
          request_id: bloodRequest.id,
          match_id,
        })),
      ])

      return NextResponse.json({
        message: 'Match declined',
        request_id,
        match_id,
        status: 'Declined',
      })
    }

    const otp = generateOtp()
    const expiresAt = minutesFromNow(getOtpTtlMinutes())

    const { data: result, error: responseError } = await userSupabase.rpc('respond_to_match', {
      p_match_id: match_id,
      p_decision: decision,
      p_secure_otp: hashOtp(otp),
      p_expires_at: expiresAt,
    })

    if (responseError) throw responseError

    const bloodRequest = result?.request
    const token = result?.token

    await createNotifications(supabase, [
      {
        user_id: auth.user!.sub,
        type: 'match_accepted',
        title: 'Match accepted',
        message: `You accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id,
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: 'match_accepted',
        title: 'Donor accepted',
        message: `A donor accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id,
      })),
    ])

    return NextResponse.json({
      message: 'Match accepted',
      request_id,
      match_id,
      status: 'Accepted',
      otp,
      expires_at: expiresAt,
      otp_ttl_seconds: getOtpTtlSeconds(),
      token_id: token?.id ?? null,
      unlocked_routes: {
        chat: `/matches/${match_id}/chat`,
        tracking: `/matches/${match_id}/tracking`,
        checkin: `/donor/match/${match_id}/checkin`,
      },
      request: result?.request ?? null,
    })
  } catch (err) {
    console.error('[POST /api/matches/respond]', err)
    return rpcErrorResponse(err as { message?: string })
  }
}
