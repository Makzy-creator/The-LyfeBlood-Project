import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './page'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  apiLogin: vi.fn(),
  setSession: vi.fn(),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/context/AppContext', () => ({ useApp: () => ({ login: mocks.login }) }))
vi.mock('@/utils/api', () => ({ apiLogin: mocks.apiLogin }))
vi.mock('@/lib/supabase-client', () => ({
  supabase: { auth: { setSession: mocks.setSession } },
}))

describe('LoginPage interactions', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(cleanup)

  it('enables native submission only after both credentials are entered', async () => {
    mocks.apiLogin.mockResolvedValue({
      user: { id: 'user-1', role: 'donor' },
      token: 'token',
      session: { access_token: 'access', refresh_token: 'refresh' },
    })
    render(<LoginPage />)

    const submit = screen.getByRole('button', { name: /sign in/i })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'donor@example.com' },
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'secret' },
    })
    expect(submit).toBeEnabled()
    fireEvent.submit(submit.closest('form'))

    expect(submit).toBeDisabled()
    await waitFor(() => expect(mocks.apiLogin).toHaveBeenCalledTimes(1))
    expect(mocks.login).toHaveBeenCalledWith({ user: { id: 'user-1', role: 'donor' }, token: 'token' })
    expect(mocks.push).toHaveBeenCalledWith('/donor/home')
  })

  it('toggles password visibility without submitting', () => {
    render(<LoginPage />)
    const password = screen.getByPlaceholderText('Your password')
    const toggle = screen.getByRole('button', { name: 'Show password' })

    expect(password).toHaveAttribute('type', 'password')
    fireEvent.click(toggle)
    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(mocks.apiLogin).not.toHaveBeenCalled()
  })

  it('shows an authentication error and permits retry', async () => {
    mocks.apiLogin.mockRejectedValue({ status: 401 })
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'person@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled()
  })
})
