import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiCreateRequest } from './api'

vi.mock('@/lib/supabase-client', () => ({
  supabase: {},
}))

describe('apiCreateRequest', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('posts through the authenticated creation endpoint and returns its contract', async () => {
    window.sessionStorage.setItem('lyfeblood.auth.token', 'session-token')
    const responseBody = {
      request: { id: 'request-1', blood_type_needed: 'O+' },
      matching: { inserted: 2, skipped: false },
      sideEffectWarnings: [],
      message: 'Request created',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    })

    await expect(
      apiCreateRequest({
        hospital_name: 'Test Hospital',
        blood_type_needed: 'O+',
        urgency_tier: 'Standard',
      })
    ).resolves.toEqual(responseBody)

    expect(fetch).toHaveBeenCalledWith('/api/requests/create', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer session-token',
      },
      method: 'POST',
      body: JSON.stringify({
        hospital_name: 'Test Hospital',
        blood_type_needed: 'O+',
        urgency_tier: 'Standard',
      }),
    })
  })
})