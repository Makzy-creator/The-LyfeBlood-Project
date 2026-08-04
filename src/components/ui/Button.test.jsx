import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

afterEach(cleanup)

describe.each([
  ['primary', PrimaryButton],
  ['secondary', SecondaryButton],
])('%s button', (_, Button) => {
  it('fires for pointer and keyboard-generated native click activation', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continue</Button>)
    const button = screen.getByRole('button', { name: 'Continue' })

    fireEvent.click(button)
    fireEvent.click(button, { detail: 0 })

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('does not fire while disabled', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Continue
      </Button>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
