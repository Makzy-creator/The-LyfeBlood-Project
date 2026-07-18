import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAuthClient, createSupabaseServerClient } from '@/lib/supabase-server'
import {
  buildClearRememberSessionCookie,
  buildRememberSessionCookie,
  readCookie,
  REMEMBER_SESSION_COOKIE,
} from '@/lib/session-cookie'

const USER_SELECT =
  'id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at'

async function loadProfile(userId: string, req: Request) {
  const supabase = createSupabaseServerClient(req)
  const { data: user, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return user
}

export async function GET(request: NextRequest) {
  try {
    const refreshToken = readCookie(request as unknown as Request, REMEMBER_SESSION_COOKIE)
    if (!refreshToken) {
      return NextResponse.json({ error: 'No remembered session' }, { status: 401 })
    }

    const authClient = createSupabaseAuthClient(request as unknown as Request)
    const { data, error } = await authClient.auth.refreshSession({
      refresh_token: decodeURIComponent(refreshToken),
    })

    if (error || !data?.session?.access_token || !data?.session?.refresh_token || !data?.user?.id) {
      return NextResponse.json(
        { error: 'Remembered session expired' },
        {
          status: 401,
          headers: {
            'Set-Cookie': buildClearRememberSessionCookie(request as unknown as Request),
          },
        }
      )
    }

    const user = await loadProfile(data.user.id, request as unknown as Request)
    if (!user) {
      return NextResponse.json(
        { error: 'Profile not found' },
        {
          status: 404,
          headers: {
            'Set-Cookie': buildClearRememberSessionCookie(request as unknown as Request),
          },
        }
      )
    }

    return NextResponse.json(
      {
        user,
        token: data.session.access_token,
        expires_at: data.session.expires_at ?? null,
        message: 'Session restored',
      },
      {
        headers: {
          'Set-Cookie': buildRememberSessionCookie(
            request as unknown as Request,
            data.session.refresh_token
          ),
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/auth/session]', err)
    return NextResponse.json({ error: 'Failed to restore session' }, { status: 500 })
  }
}
