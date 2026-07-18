import { NextRequest, NextResponse } from 'next/server'
import { getCanonicalRole, requireAuth } from '@/lib/auth-server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

function normalizeRole(role: string) {
  return ['donor', 'requester', 'hospital'].includes(role) ? role : null
}

const SAFE_USER_SELECT =
  'id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request)
    if (auth.error) return auth.error

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: user, error } = await supabase
      .from('users')
      .select(SAFE_USER_SELECT)
      .eq('id', auth.user!.sub)
      .maybeSingle()

    if (error) throw error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request as unknown as Request)
    if (auth.error) return auth.error

    const body = await request.json()
    const { id, full_name, phone, role, blood_type, location, availability_status } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    if (id !== auth.user!.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!full_name?.trim()) {
      return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
    }

    const normalizedRole = role ? normalizeRole(role) : null
    if (role && !normalizedRole) {
      return NextResponse.json(
        { error: 'role must be donor, requester, or hospital' },
        { status: 400 }
      )
    }

    if (normalizedRole && getCanonicalRole(normalizedRole) !== getCanonicalRole(auth.user!.role)) {
      return NextResponse.json({ error: 'Role changes require admin approval' }, { status: 403 })
    }

    if (getCanonicalRole(auth.user!.role) === 'donor' && !blood_type) {
      return NextResponse.json({ error: 'blood_type is required for donor role' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request as unknown as Request)
    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: full_name.trim(),
        phone: phone?.trim() ?? null,
        blood_type: blood_type ?? null,
        location: location?.trim() ?? null,
        availability_status: availability_status ? 1 : 0,
      })
      .eq('id', id)
      .select(SAFE_USER_SELECT)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ user, message: 'Profile updated' })
  } catch (err) {
    console.error('[PATCH /api/profile]', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
