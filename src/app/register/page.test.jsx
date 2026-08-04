import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RegisterPage from './page'
import { apiRegister } from '@/utils/api'

const mocks = vi.hoisted(() => ({ push: vi.fn(), setSession: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/utils/api', () => ({ apiRegister: vi.fn() }))
vi.mock('@/lib/supabase-client', () => ({
  supabase: { auth: { setSession: mocks.setSession } },
}))

describe('RegisterPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState({}, '', '/register')
  })
  afterEach(cleanup)

  it('switches immediately between patient/family and hospital registration', () => {
    render(<RegisterPage />)
    const patient = screen.getByRole('button', { name: 'Patient / Family' })
    const hospital = screen.getByRole('button', { name: 'Hospital Officer' })

    fireEvent.click(patient)
    expect(patient).toHaveAttribute('aria-pressed', 'true')
    expect(hospital).toHaveAttribute('aria-pressed', 'false')
    expect(window.location.search).toBe('?role=requester')

    fireEvent.click(hospital)
    expect(hospital).toHaveAttribute('aria-pressed', 'true')
    expect(patient).toHaveAttribute('aria-pressed', 'false')
    expect(window.location.search).toBe('?role=hospital')
  })

  it('initializes the selected role from the query string', () => {
    window.history.replaceState({}, '', '/register?role=hospital')
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: 'Hospital Officer' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('toggles both password fields without advancing the form', () => {
    render(<RegisterPage />)
    const password = screen.getByPlaceholderText('Min. 8 characters')
    const confirmation = screen.getByPlaceholderText('Re-enter your password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show confirm password' }))

    expect(password).toHaveAttribute('type', 'text')
    expect(confirmation).toHaveAttribute('type', 'text')
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeEnabled()
    fireEvent.click(continueButton)
    expect(screen.getByText(/Enter your full name/)).toBeInTheDocument()
    expect(screen.getByText(/Enter your email address/)).toBeInTheDocument()
  })

  it('submits requester role and its role-specific details', async () => {
    apiRegister.mockResolvedValue({
      session: null,
      requiresEmailConfirmation: false,
      email: 'family@example.com',
    })
    render(<RegisterPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Patient / Family' }))
    fireEvent.change(screen.getByPlaceholderText('e.g. Chukwuemeka Obi'), {
      target: { value: 'Family Member' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'family@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('+234 800 000 0000'), {
      target: { value: '+2348000000000' },
    })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.change(screen.getByPlaceholderText('e.g. Mr. Emeka Obi'), {
      target: { value: 'Patient One' },
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Sibling' } })
    fireEvent.click(screen.getByRole('button', { name: 'O+' }))
    fireEvent.change(screen.getByPlaceholderText("e.g. St. David's Hospital, Owerri"), {
      target: { value: 'General Hospital' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox))
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await vi.waitFor(() =>
      expect(apiRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'requester',
          registration_details: expect.objectContaining({
            patient_name: 'Patient One',
            relationship: 'Sibling',
            hospital: 'General Hospital',
          }),
        })
      )
    )
  })

  it('submits hospital role and facility details', async () => {
    apiRegister.mockResolvedValue({
      session: null,
      requiresEmailConfirmation: false,
      email: 'officer@example.com',
    })
    render(<RegisterPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Hospital Officer' }))
    fireEvent.change(screen.getByPlaceholderText('e.g. Chukwuemeka Obi'), {
      target: { value: 'Hospital Officer' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'officer@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('+234 800 000 0000'), {
      target: { value: '+2348000000000' },
    })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByPlaceholderText('e.g. Federal Medical Centre Owerri'), {
      target: { value: 'Federal Medical Centre' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. Blood Bank & Procurement'), {
      target: { value: 'Blood Bank' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. Orlu Road, Owerri Municipal'), {
      target: { value: 'Orlu Road' },
    })
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Federal Teaching / Medical Centre' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByPlaceholderText('e.g. IMO/HEFA/2024/00142'), {
      target: { value: 'IMO/HEFA/2026/1' },
    })
    screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox))
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await vi.waitFor(() =>
      expect(apiRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'hospital',
          registration_details: expect.objectContaining({
            hospital_name: 'Federal Medical Centre',
            department: 'Blood Bank',
            facility_type: 'Federal Teaching / Medical Centre',
            licence_number: 'IMO/HEFA/2026/1',
          }),
        })
      )
    )
  })

  it('continues to confirmation when browser session initialization fails', async () => {
    apiRegister.mockResolvedValue({
      session: { access_token: 'access', refresh_token: 'refresh' },
      requiresEmailConfirmation: false,
      email: 'donor@example.com',
    })
    mocks.setSession.mockRejectedValue(new Error('client config missing'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<RegisterPage />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Chukwuemeka Obi'), {
      target: { value: 'Donor One' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'donor@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('+234 800 000 0000'), {
      target: { value: '+2348000000000' },
    })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'O+' }))
    fireEvent.change(screen.getByPlaceholderText('e.g. 28'), { target: { value: '28' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Owerri North, Imo State'), {
      target: { value: 'Owerri' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await vi.waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining('/register/confirmation'))
    )
    warn.mockRestore()
  })
})
