import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase-client', () => ({
  supabase: {},
}))

describe('apiCreateRequest', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    window.sessionStorage.clear()
    window.sessionStorage.setItem('lyfeblood.auth.token', 'session-token')
  })

  it('creates requests through the authenticated Next.js API route', async () => {
    const payload = {
      hospital_name: 'Federal Medical Centre Owerri',
      blood_type_needed: 'O+',
      urgency_tier: 'Standard',
      units_needed: 2,
    }
    const request = { id: 'request-123', ...payload }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ request, message: 'Request created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { apiCreateRequest } = await import('./api.js')
    await expect(apiCreateRequest(payload)).resolves.toMatchObject({ request })

    expect(fetchMock).toHaveBeenCalledWith('/api/requests/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer session-token',
      },
      body: JSON.stringify(payload),
    })
  })

  it('surfaces a failed creation response to the caller', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unable to create this request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { apiCreateRequest } = await import('./api.js')
    await expect(apiCreateRequest({})).rejects.toThrow('Unable to create this request')
  })
})
