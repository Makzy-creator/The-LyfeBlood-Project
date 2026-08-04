import { beforeEach, describe, expect, it, vi } from 'vitest'

const createUser = vi.fn()
const signInWithPassword = vi.fn()
const profileSingle = vi.fn()
const profileSelect = vi.fn(() => ({ single: profileSingle }))
const profileUpsert = vi.fn(() => ({ select: profileSelect }))
const createAdmin = vi.fn(() => ({ auth: { admin: { createUser } } }))
const createAuth = vi.fn(() => ({ auth: { signInWithPassword } }))
const createServer = vi.fn(() => ({ from: vi.fn(() => ({ upsert: profileUpsert })) }))

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseAdminClient: createAdmin,
  createSupabaseAuthClient: createAuth,
  createSupabaseServerClient: createServer,
  normalizeEmail: (email) => email.trim().toLowerCase(),
}))

function request(overrides = {}) {
  return new Request('https://lyfeblood.test/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Test User',
      email: 'USER@example.com',
      phone: '+2348000000000',
      password: 'password123',
      role: 'requester',
      blood_type: 'O+',
      location: 'Owerri',
      registration_details: { patient_name: 'Patient One' },
      ...overrides,
    }),
  })
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createAdmin.mockImplementation(() => ({ auth: { admin: { createUser } } }))
    createUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    profileSingle.mockResolvedValue({
      data: { id: 'user-1', email: 'user@example.com', role: 'requester' },
      error: null,
    })
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-1' },
        session: { access_token: 'access', refresh_token: 'refresh' },
      },
      error: null,
    })
  })

  it('creates a profile with normalized role-specific registration details', async () => {
    const { POST } = await import('./route')
    const response = await POST(request())
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(profileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'requester',
        email: 'user@example.com',
        registration_details: expect.objectContaining({ patient_name: 'Patient One' }),
      }),
      { onConflict: 'id' }
    )
    expect(json.session.access_token).toBe('access')
  })

  it('recovers an existing partial registration when the password is valid', async () => {
    const { POST } = await import('./route')
    createUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User already registered'),
    })

    const response = await POST(request())
    expect(response.status).toBe(201)
    expect(profileUpsert).toHaveBeenCalled()
  })

  it('returns 409 for a duplicate email when credentials do not match', async () => {
    const { POST } = await import('./route')
    createUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User already registered'),
    })
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('Invalid credentials'),
    })

    const response = await POST(request())
    expect(response.status).toBe(409)
    expect(profileUpsert).not.toHaveBeenCalled()
  })

  it('returns an actionable error when server configuration is missing', async () => {
    const { POST } = await import('./route')
    createAdmin.mockImplementationOnce(() => {
      throw new Error('Supabase admin configuration is missing')
    })

    const response = await POST(request())
    expect(response.status).toBe(500)
    expect((await response.json()).error).toContain('configuration is missing')
  })

  it('reports profile creation failure after the auth account is created', async () => {
    const { POST } = await import('./route')
    profileSingle.mockResolvedValueOnce({ data: null, error: new Error('profile rejected') })

    const response = await POST(request())
    expect(response.status).toBe(500)
    expect((await response.json()).error).toBe('profile rejected')
  })

  it('returns account success even when no server session can be established', async () => {
    const { POST } = await import('./route')
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('sign in unavailable'),
    })

    const response = await POST(request())
    const json = await response.json()
    expect(response.status).toBe(201)
    expect(json.session).toBeNull()
    expect(json.user.id).toBe('user-1')
  })
})
