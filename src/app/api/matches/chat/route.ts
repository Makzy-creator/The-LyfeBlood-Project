import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken, requireAuth } from '@/lib/auth-server'
import { loadAcceptedPatientDonorMatch } from '@/lib/match-access'
import { createSupabaseServerClient, getSupabaseConfig } from '@/lib/supabase-server'

const QUICK_REPLIES: Record<string, string> = {
  on_the_way: "I'm on my way",
  delayed: "I'm delayed",
  arrived: "I've arrived",
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
    const { data: messages, error } = await userSupabase
      .from('chat_messages')
      .select('id, match_id, sender_id, message, quick_type, created_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) throw error

    return NextResponse.json({
      messages: messages ?? [],
      match: access.match,
      request: access.bloodRequest,
      participant_role: access.participantRole,
      quick_replies: QUICK_REPLIES,
    })
  } catch (err) {
    console.error('[GET /api/matches/chat]', err)
    return NextResponse.json({ error: 'Failed to load chat' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, ['donor', 'patient'])
    if (auth.error) return auth.error

    const body = await request.json()
    const matchId = body.match_id
    const quickType = body.quick_type ?? null
    const quickMessage = quickType ? QUICK_REPLIES[quickType] : null
    const message = (quickMessage ?? String(body.message ?? '')).trim()

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'message must be 500 characters or fewer' },
        { status: 400 }
      )
    }
    if (quickType && !quickMessage) {
      return NextResponse.json({ error: 'quick_type is invalid' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const access = await loadAcceptedPatientDonorMatch(
      supabase,
      matchId,
      auth as { user: { sub: string; role: string } }
    )
    if (access.error) return access.error

    const userSupabase = createUserSupabaseClient(request)
    const { data: insertedMessage, error } = await userSupabase
      .from('chat_messages')
      .insert({
        match_id: matchId,
        sender_id: auth.user!.sub,
        message,
        quick_type: quickType,
      })
      .select('id, match_id, sender_id, message, quick_type, created_at')
      .single()

    if (error) throw error

    if (
      access.participantRole === 'donor' &&
      quickType === 'on_the_way' &&
      !(access.match as Record<string, unknown>).on_the_way_at
    ) {
      await supabase
        .from('matches')
        .update({ on_the_way_at: new Date().toISOString() })
        .eq('id', matchId)
        .eq('donor_id', auth.user!.sub)
    }

    if (
      access.participantRole === 'donor' &&
      quickType === 'arrived' &&
      !(access.match as Record<string, unknown>).arrived_at
    ) {
      await supabase
        .from('matches')
        .update({ arrived_at: new Date().toISOString() })
        .eq('id', matchId)
        .eq('donor_id', auth.user!.sub)
    }

    return NextResponse.json({ message: insertedMessage })
  } catch (err) {
    console.error('[POST /api/matches/chat]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
