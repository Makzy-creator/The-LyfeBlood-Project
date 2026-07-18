import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken, requireAuth } from '@/lib/auth-server'
import { getSupabaseConfig } from '@/lib/supabase-server'

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
    const auth = await requireAuth(request as unknown as Request, [
      'donor',
      'patient',
      'hospital_staff',
      'admin',
    ])
    if (auth.error) return auth.error

    const url = new URL(request.url)
    const limit = Math.min(Number.parseInt(url.searchParams.get('limit') ?? '50', 10), 100)
    const unreadOnly = url.searchParams.get('unread') === 'true'

    const userSupabase = createUserSupabaseClient(request)
    let query = userSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', auth.user!.sub)
      .lte('deliver_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    const [{ data: notifications, error }, { count, error: countError }] = await Promise.all([
      query,
      userSupabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', auth.user!.sub)
        .lte('deliver_at', new Date().toISOString())
        .is('read_at', null),
    ])

    if (error) throw error
    if (countError) throw countError

    return NextResponse.json({
      notifications: notifications ?? [],
      unread_count: count ?? 0,
    })
  } catch (err) {
    console.error('[GET /api/notifications]', err)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request, [
      'donor',
      'patient',
      'hospital_staff',
      'admin',
    ])
    if (auth.error) return auth.error

    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : null
    const read = body.read !== false
    const readAt = read ? new Date().toISOString() : null

    const userSupabase = createUserSupabaseClient(request)
    let update = userSupabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('user_id', auth.user!.sub)

    if (ids?.length) {
      update = update.in('id', ids)
    }

    const { error } = await update
    if (error) throw error

    return NextResponse.json({
      message: read ? 'Notifications marked read' : 'Notifications marked unread',
    })
  } catch (err) {
    console.error('[PATCH /api/notifications]', err)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
