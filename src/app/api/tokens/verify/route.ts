import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseConfig } from '@/lib/supabase-server'
import { getBearerToken, requireAuth } from '@/lib/auth-server'
import { verifyOtpHash } from '@/lib/otp-server'
import { createNotifications, requestRecipientIds } from '@/lib/notifications-server'

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
  const message = error?.message ?? 'Verification failed'
  if (message.includes('already been used')) {
    return NextResponse.json({ error: message }, { status: 409 })
  }
  if (message.includes('expired') || message.includes('Invalid')) {
    return NextResponse.json({ error: message }, { status: 401 })
  }
  if (message.includes('Forbidden') || message.includes('not verified')) {
    return NextResponse.json({ error: message }, { status: 403 })
  }
  if (message.includes('not ready')) {
    return NextResponse.json({ error: message }, { status: 409 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, ['hospital_staff', 'admin'])
    if (auth.error) return auth.error

    const body = await request.json()
    const { otp, match_id } = body

    const normalizedOtp = String(otp ?? '').trim()
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return NextResponse.json({ error: 'A 6-digit OTP is required' }, { status: 400 })
    }
    if (!match_id) {
      return NextResponse.json(
        { error: 'match_id is required for check-in verification' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const now = new Date().toISOString()

    await supabase
      .from('verification_tokens')
      .update({ status: 'Expired' })
      .eq('status', 'Active')
      .lt('expires_at', now)

    const { data: tokenRows, error: tokenLookupError } = await supabase
      .from('verification_tokens')
      .select('id, match_id, secure_otp, expires_at, status')
      .eq('match_id', match_id)
      .order('created_at', { ascending: false })
    if (tokenLookupError) throw tokenLookupError

    const matchingToken = (tokenRows ?? []).find((row: { secure_otp: string }) =>
      verifyOtpHash(normalizedOtp, row.secure_otp)
    )
    if (matchingToken?.status === 'Used') {
      return NextResponse.json({ error: 'OTP has already been used' }, { status: 409 })
    }
    if (matchingToken?.status === 'Expired') {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 401 })
    }

    const token = matchingToken?.status === 'Active' ? matchingToken : null
    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    if (new Date(token.expires_at) < new Date()) {
      const { error } = await supabase
        .from('verification_tokens')
        .update({ status: 'Expired' })
        .eq('id', token.id)

      if (error) throw error

      return NextResponse.json({ error: 'OTP has expired' }, { status: 401 })
    }

    const userSupabase = createUserSupabaseClient(request)
    const { data: result, error: verifyError } = await userSupabase.rpc('verify_donor_otp', {
      p_token_id: String(token.id),
      p_match_id: match_id,
      p_verified_by: auth.user!.sub,
    })

    if (verifyError) throw verifyError

    const match = result?.match
    const arrivedRequest = result?.request
    const bloodRequest = result?.request
    const donor = result?.donor

    await createNotifications(supabase, [
      {
        user_id: donor.id,
        type: 'otp_checked_in',
        title: 'Check-in verified',
        message: `Your arrival at ${arrivedRequest.hospital_name} was verified.`,
        request_id: match.request_id,
        match_id: match.id,
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: 'otp_checked_in',
        title: 'Donor checked in',
        message: `${donor.full_name ?? 'A donor'} checked in for ${arrivedRequest.blood_type_needed}.`,
        request_id: match.request_id,
        match_id: match.id,
      })),
    ])

    return NextResponse.json({
      message: 'Check-in verified. Donor arrival confirmed.',
      token_id: token.id,
      request_id: match.request_id,
      request: arrivedRequest ?? null,
      donor,
      checked_in_at: result?.checked_in_at,
      verified_by: auth.user!.sub,
      new_status: 'checked_in',
    })
  } catch (err) {
    console.error('[POST /api/tokens/verify]', err)
    return rpcErrorResponse(err as { message?: string })
  }
}
