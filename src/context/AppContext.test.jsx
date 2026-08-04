import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider, useApp } from './AppContext'

const { apiCreateRequest } = vi.hoisted(() => ({
  apiCreateRequest: vi.fn(),
}))

vi.mock('@/utils/api', () => ({
  apiCreateRequest,
  apiDeleteRequest: vi.fn(),
  apiGetNotifications: vi.fn().mockResolvedValue({ notifications: [], unread_count: 0 }),
  apiGetProfile: vi.fn(),
  apiUpdateNotifications: vi.fn(),
  apiUpdateRequestStatus: vi.fn(),
}))

vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
    auth: {
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

function Harness() {
  const { addRequest, bloodRequests } = useApp()
  const create = async () => {
    try {
      await addRequest({
        hospitalName: 'Federal Medical Centre Owerri',
        bloodGroup: 'O+',
        tier: 'standard',
        unitsNeeded: 2,
        requestedBy: 'untrusted-client-value',
      })
    } catch (error) {
      document.body.dataset.creationError = error.message
    }
  }

  return (
    <>
      <button onClick={create}>Create</button>
      <span data-testid="request-count">{bloodRequests.length}</span>
    </>
  )
}

describe('AppProvider addRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.removeAttribute('data-creation-error')
    window.sessionStorage.clear()
    window.sessionStorage.setItem(
      'lyfeblood.auth.user',
      JSON.stringify({ id: 'user-123', role: 'patient_family', email: 'patient@example.com' })
    )
    window.sessionStorage.setItem('lyfeblood.auth.token', 'session-token')
  })

  it('adds the API response to state without sending client ownership', async () => {
    apiCreateRequest.mockResolvedValue({
      request: {
        id: 'request-123',
        hospital_name: 'Federal Medical Centre Owerri',
        blood_type_needed: 'O+',
        urgency_tier: 'Standard',
      },
    })

    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )
    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => expect(screen.getByTestId('request-count')).toHaveTextContent('1'))
    expect(apiCreateRequest).toHaveBeenCalledWith(
      expect.not.objectContaining({ requested_by: expect.anything() })
    )
  })

  it('keeps request state unchanged when creation fails', async () => {
    apiCreateRequest.mockRejectedValue(new Error('Creation failed'))

    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    )
    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => expect(document.body.dataset.creationError).toBe('Creation failed'))
    expect(screen.getByTestId('request-count')).toHaveTextContent('0')
  })
})
