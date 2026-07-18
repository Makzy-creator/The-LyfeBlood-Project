import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseAuthClient,
  createSupabaseServerClient,
  normalizeEmail,
} from '@/lib/supabase-server'
import { buildRememberSessionCookie, buildClearRememberSessionCookie } from '@/lib/session-cookie'

const USER_SELECT =
  'id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email?.trim() || !password)
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })

    const normalizedEmail = normalizeEmail(email)
    const authClient = createSupabaseAuthClient(request as unknown as Request)
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: user, error: profileError } = await supabase
      .from('users')
      .select(USER_SELECT)
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let setCookieHeader = ''

    if (rememberMe) {
      setCookieHeader = buildRememberSessionCookie(
        request as unknown as Request,
        authData.session.refresh_token
      )
    } else {
      setCookieHeader = buildClearRememberSessionCookie(request as unknown as Request)
    }

    return NextResponse.json(
      {
        user,
        token: authData.session.access_token,
        expires_at: authData.session.expires_at ?? null,
        message: 'Login successful',
      },
      {
        headers: setCookieHeader
          ? {
              'Set-Cookie': setCookieHeader,
            }
          : undefined,
      }
    )
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
