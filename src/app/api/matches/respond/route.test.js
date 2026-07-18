import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClient = vi.fn()
const serverFrom = vi.fn()
const userRpc = vi.fn()
const requireAuth = vi.fn()
const getBearerToken = vi.fn()
const createNotifications = vi.fn()
const requestRecipientIds = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}))

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn(() => ({
    from: serverFrom,
  })),
  getSupabaseConfig: vi.fn(() => ({
    url: 'https://supabase.test',
    anonKey: 'anon-key',
  })),
}))

vi.mock('@/lib/auth-server', () => ({
  getBearerToken,
  requireAuth,
}))

vi.mock('@/lib/otp-server', () => ({
  generateOtp: vi.fn(() => '123456'),
  getOtpTtlMinutes: vi.fn(() => 15),
  getOtpTtlSeconds: vi.fn(() => 900),
  hashOtp: vi.fn((otp) => `hashed-${otp}`),
}))

vi.mock('@/lib/notifications-server', () => ({
  createNotifications,
  requestRecipientIds,
}))

function makeRequest(body, token = 'session-token') {
  return new Request('https://lyfeblood.test/api/matches/respond', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

function matchQueryResult(result) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    limit: vi.fn(async () => result),
  }
  return query
}

const requestRow = {
  id: 'request-1',
  blood_type_needed: 'O+',
  hospital_name: 'Federal Medical Centre Owerri',
}

describe('POST /api/matches/respond', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuth.mockResolvedValue({
      error: null,
      user: { sub: 'donor-1', role: 'donor', email: 'donor@example.com' },
    })
    getBearerToken.mockReturnValue('session-token')
    requestRecipientIds.mockReturnValue(['hospital-1'])
    createClient.mockReturnValue({ rpc: userRpc })
    userRpc.mockResolvedValue({
      data: {
        request: requestRow,
        token: { id: 'token-1' },
      },
      error: null,
    })
    serverFrom.mockReturnValue(
      matchQueryResult({
        data: [
          {
            id: 'match-1',
            request_id: 'request-1',
            donor_id: 'donor-1',
            match_status: 'Alerted',
          },
        ],
        error: null,
      })
    )
  })

  it('records a successful donor response for the authenticated donor and request', async () => {
    const { POST } = await import('./route.js')

    const response = await POST(
      makeRequest({
        request_id: 'request-1',
        decision: 'Accepted',
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toMatchObject({
      message: 'Match accepted',
      request_id: 'request-1',
      match_id: 'match-1',
      status: 'Accepted',
      otp: '123456',
      token_id: 'token-1',
    })
    expect(serverFrom).toHaveBeenCalledWith('matches')
    const matchQuery = serverFrom.mock.results[0].value
    expect(matchQuery.eq).toHaveBeenCalledWith('donor_id', 'donor-1')
    expect(matchQuery.eq).toHaveBeenCalledWith('request_id', 'request-1')
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
    expect(userRpc).toHaveBeenCalledWith('respond_to_match', {
      p_match_id: 'match-1',
      p_decision: 'Accepted',
      p_secure_otp: 'hashed-123456',
      p_expires_at: expect.any(String),
    })
    expect(createNotifications).toHaveBeenCalled()
  })

  it('returns 401 when authentication is missing', async () => {
    const { POST } = await import('./route.js')
    requireAuth.mockResolvedValueOnce({
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
    })

    const response = await POST(
      makeRequest(
        {
          request_id: 'request-1',
          decision: 'Accepted',
        },
        null
      )
    )
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
    expect(serverFrom).not.toHaveBeenCalled()
    expect(userRpc).not.toHaveBeenCalled()
  })

  it('returns 404 for an invalid request ID', async () => {
    const { POST } = await import('./route.js')
    serverFrom.mockReturnValueOnce(matchQueryResult({ data: [], error: null }))

    const response = await POST(
      makeRequest({
        request_id: 'missing-request',
        decision: 'Accepted',
      })
    )
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error).toBe('Request not found or not assigned to this donor')
    expect(userRpc).not.toHaveBeenCalled()
  })

  it('prevents duplicate responses from the same donor to the same request', async () => {
    const { POST } = await import('./route.js')
    serverFrom.mockReturnValueOnce(
      matchQueryResult({
        data: [
          {
            id: 'match-1',
            request_id: 'request-1',
            donor_id: 'donor-1',
            match_status: 'Accepted',
          },
        ],
        error: null,
      })
    )

    const response = await POST(
      makeRequest({
        request_id: 'request-1',
        decision: 'Accepted',
      })
    )
    const json = await response.json()

    expect(response.status).toBe(409)
    expect(json.error).toBe('Match already responded to')
    expect(userRpc).not.toHaveBeenCalled()
  })
})
