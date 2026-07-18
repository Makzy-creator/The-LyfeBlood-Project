import { beforeEach, describe, expect, it, vi } from 'vitest'

const authGetUser = vi.fn()
const profileMaybeSingle = vi.fn()
const rpc = vi.fn()
const createClient = vi.fn()
const createMatchesForRequest = vi.fn()
const notifyRequestRecipients = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}))

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseAuthClient: vi.fn(() => ({
    auth: { getUser: authGetUser },
  })),
  createSupabaseServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: profileMaybeSingle,
        })),
      })),
    })),
  })),
  getSupabaseConfig: vi.fn(() => ({
    url: 'https://supabase.test',
    anonKey: 'anon-key',
    serviceRoleKey: 'service-role-key',
  })),
}))

vi.mock('@/lib/matching', () => ({
  createMatchesForRequest,
}))

vi.mock('@/lib/notifications-server', () => ({
  notifyRequestRecipients,
}))

function makeRequest(body, token = 'session-token') {
  return new Request('https://lyfeblood.test/api/requests/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const validPayload = {
  hospital_name: 'Federal Medical Centre Owerri',
  blood_type_needed: 'O+',
  urgency_tier: 'Standard',
  units_needed: 2,
  patient_ref: 'CASE-9',
  request_type: 'Emergency',
}

describe('POST /api/requests/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'patient@example.com' } },
      error: null,
    })
    profileMaybeSingle.mockResolvedValue({
      data: { id: 'user-123', email: 'patient@example.com', role: 'patient_family' },
      error: null,
    })
    rpc.mockResolvedValue({
      data: {
        id: 'request-123',
        requested_by: 'user-123',
        hospital_name: 'Federal Medical Centre Owerri',
        blood_type_needed: 'O+',
      },
      error: null,
    })
    createClient.mockReturnValue({ rpc })
    createMatchesForRequest.mockResolvedValue({ inserted: 0, skipped: true })
    notifyRequestRecipients.mockResolvedValue(undefined)
  })

  it('creates a request for an authenticated patient/family user', async () => {
    const { POST } = await import('./route.js')

    const response = await POST(makeRequest(validPayload))
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.request).toMatchObject({
      id: 'request-123',
      requested_by: 'user-123',
    })
    expect(rpc).toHaveBeenCalledWith(
      'create_blood_request',
      expect.objectContaining({
        p_hospital_name: 'Federal Medical Centre Owerri',
        p_blood_type_needed: 'O+',
        p_units_needed: 2,
      })
    )
  })

  it('creates a hospital request with several selected blood types', async () => {
    const { POST } = await import('./route.js')
    profileMaybeSingle.mockResolvedValueOnce({
      data: { id: 'user-123', email: 'hospital@example.com', role: 'hospital_officer' },
      error: null,
    })

    const response = await POST(
      makeRequest({
        ...validPayload,
        blood_type_needed: ['O+', 'A-', 'B+'],
      })
    )

    expect(response.status).toBe(201)
    expect(rpc).toHaveBeenCalledWith(
      'create_blood_request',
      expect.objectContaining({
        p_blood_type_needed: 'O+, A-, B+',
      })
    )
  })

  it('deduplicates selected blood types before creating a hospital request', async () => {
    const { POST } = await import('./route.js')
    profileMaybeSingle.mockResolvedValueOnce({
      data: { id: 'user-123', email: 'hospital@example.com', role: 'hospital_officer' },
      error: null,
    })

    const response = await POST(
      makeRequest({
        ...validPayload,
        blood_type_needed: ['O+', 'A-', 'O+'],
      })
    )

    expect(response.status).toBe(201)
    expect(rpc).toHaveBeenCalledWith(
      'create_blood_request',
      expect.objectContaining({
        p_blood_type_needed: 'O+, A-',
      })
    )
  })

  it('returns 401 when the submission is unauthenticated', async () => {
    const { POST } = await import('./route.js')

    const response = await POST(makeRequest(validPayload, null))
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toContain('Please sign in')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('returns an actionable error when the authenticated user has no profile', async () => {
    const { POST } = await import('./route.js')
    profileMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const response = await POST(makeRequest(validPayload))
    const json = await response.json()

    expect(response.status).toBe(409)
    expect(json.error).toContain('profile is missing')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('rejects malformed request input before creating a request', async () => {
    const { POST } = await import('./route.js')

    const response = await POST(makeRequest({ ...validPayload, blood_type_needed: '' }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('blood_type_needed is required')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('rejects requests with no selected blood types', async () => {
    const { POST } = await import('./route.js')

    const response = await POST(makeRequest({ ...validPayload, blood_type_needed: [] }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('blood_type_needed is required')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('derives ownership from the authenticated user instead of client input', async () => {
    const { POST } = await import('./route.js')

    const response = await POST(
      makeRequest({
        ...validPayload,
        requested_by: 'attacker-user',
      })
    )

    expect(response.status).toBe(201)
    expect(createClient).toHaveBeenCalledWith(
      'https://supabase.test',
      'anon-key',
      expect.objectContaining({
        global: {
          headers: {
            Authorization: 'Bearer session-token',
          },
        },
      })
    )
    expect(rpc.mock.calls[0][1]).not.toHaveProperty('requested_by')
    expect(rpc.mock.calls[0][1]).not.toHaveProperty('p_requested_by')
    expect((await response.json()).request.requested_by).toBe('user-123')
  })
})
