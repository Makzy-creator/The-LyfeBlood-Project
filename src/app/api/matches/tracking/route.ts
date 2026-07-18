import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken, requireAuth } from '@/lib/auth-server'
import { loadAcceptedPatientDonorMatch } from '@/lib/match-access'
import { createSupabaseServerClient, getSupabaseConfig } from '@/lib/supabase-server'

const TRAVEL_STATUSES = new Set(['on_the_way', 'arrived'])

function toNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function getMatchId(request: NextRequest) {
  return new URL(request.url).searchParams.get('match_id')
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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, ['donor', 'patient'])
    if (auth.error) return auth.error

    const matchId = getMatchId(request)
    const supabase = createSupabaseServerClient(request as unknown as Request)
    const access = await loadAcceptedPatientDonorMatch(
      supabase,
      matchId!,
      auth as { user: { sub: string; role: string } }
    )
    if (access.error) return access.error

    const userSupabase = createUserSupabaseClient(request)
    const { data: locations, error } = await userSupabase
      .from('donor_locations')
      .select(
        'id, match_id, donor_id, latitude, longitude, distance_km, eta_minutes, status, created_at'
      )
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      match: access.match,
      request: access.bloodRequest,
      participant_role: access.participantRole,
      latest_location: locations?.[0] ?? null,
      locations: locations ?? [],
    })
  } catch (err) {
    console.error('[GET /api/matches/tracking]', err)
    return NextResponse.json({ error: 'Failed to load tracking' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, ['donor'])
    if (auth.error) return auth.error

    const body = await request.json()
    const matchId = body.match_id
    const latitude = toNumber(body.latitude)
    const longitude = toNumber(body.longitude)
    const status = body.status ?? 'on_the_way'

    if (!TRAVEL_STATUSES.has(status)) {
      return NextResponse.json({ error: 'status must be on_the_way or arrived' }, { status: 400 })
    }
    if (latitude === null || (latitude as number) < -90 || (latitude as number) > 90) {
      return NextResponse.json({ error: 'valid latitude is required' }, { status: 400 })
    }
    if (longitude === null || (longitude as number) < -180 || (longitude as number) > 180) {
      return NextResponse.json({ error: 'valid longitude is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const access = await loadAcceptedPatientDonorMatch(
      supabase,
      matchId,
      auth as { user: { sub: string; role: string } }
    )
    if (access.error) return access.error
    if (
      access.participantRole !== 'donor' ||
      (access.match as Record<string, unknown>).donor_id !== auth.user!.sub
    ) {
      return NextResponse.json(
        { error: 'Only the accepted donor can update tracking' },
        { status: 403 }
      )
    }
    if ((access.match as Record<string, unknown>).arrived_at && status !== 'arrived') {
      return NextResponse.json(
        { error: 'Location updates are closed after arrival' },
        { status: 409 }
      )
    }

    const userSupabase = createUserSupabaseClient(request)
    const { data: result, error } = await userSupabase.rpc('update_tracking', {
      p_match_id: matchId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_status: status,
    })

    if (error) throw error

    return NextResponse.json({ location: result?.location ?? null })
  } catch (err) {
    console.error('[POST /api/matches/tracking]', err)
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 })
  }
}
