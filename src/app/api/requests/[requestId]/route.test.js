import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuth = vi.fn()
const from = vi.fn()

vi.mock('@/lib/auth-server', () => ({
  requireAuth,
  getCanonicalRole: vi.fn((role) => role),
}))

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn(() => ({ from })),
}))

function requestRow(overrides = {}) {
  return {
    id: 'request-1',
    requested_by: 'user-1',
    hospital_id: null,
    created_at: '2020-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function configureDatabase(row, failureTable = null) {
  from.mockImplementation((table) => {
    if (table === 'blood_requests') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: failureTable === table ? new Error('delete failed') : null,
          }),
        })),
      }
    }

    return {
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          error: failureTable === table ? new Error('delete failed') : null,
        }),
      })),
    }
  })
}

async function removeRequest() {
  const { DELETE } = await import('./route')
  return DELETE(new Request('https://lyfeblood.test/api/requests/request-1'), {
    params: Promise.resolve({ requestId: 'request-1' }),
  })
}

describe('DELETE /api/requests/:requestId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuth.mockResolvedValue({ user: { sub: 'user-1', role: 'patient' } })
  })

  it('deletes an owned request after 24 hours and its related records', async () => {
    configureDatabase(requestRow())

    const response = await removeRequest()

    expect(response.status).toBe(200)
    expect(from).toHaveBeenCalledWith('notifications')
    expect(from).toHaveBeenCalledWith('matches')
    expect(from).toHaveBeenCalledWith('blood_requests')
  })

  it('rejects deletion before 24 hours', async () => {
    configureDatabase(requestRow({ created_at: new Date().toISOString() }))

    const response = await removeRequest()

    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatch(/after 24 hours/i)
  })

  it('does not reveal an unauthorized request', async () => {
    requireAuth.mockResolvedValue({ user: { sub: 'another-user', role: 'patient' } })
    configureDatabase(requestRow())

    const response = await removeRequest()

    expect(response.status).toBe(404)
  })

  it('returns not found for a missing request', async () => {
    configureDatabase(null)

    const response = await removeRequest()

    expect(response.status).toBe(404)
  })

  it('returns a server error when deletion fails', async () => {
    configureDatabase(requestRow(), 'matches')

    const response = await removeRequest()

    expect(response.status).toBe(500)
  })
})
