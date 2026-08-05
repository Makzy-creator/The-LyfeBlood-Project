import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RequestDeleteControl from './RequestDeleteControl'

afterEach(() => vi.restoreAllMocks())

describe('RequestDeleteControl', () => {
  it('explains and disables deletion before 24 hours', () => {
    render(
      <RequestDeleteControl
        request={{ requestDate: new Date().toISOString() }}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Delete available after 24 hours')).toBeInTheDocument()
  })

  it('confirms and deletes an eligible request once', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <RequestDeleteControl
        request={{ id: 'request-1', requestDate: '2020-01-01T00:00:00.000Z' }}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete request' }))
    expect(screen.getByRole('button')).toBeDisabled()
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1))
  })

  it('surfaces deletion failures', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <RequestDeleteControl
        request={{ id: 'request-1', requestDate: '2020-01-01T00:00:00.000Z' }}
        onDelete={vi.fn().mockRejectedValue(new Error('Delete failed'))}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete request' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Delete failed')
  })
})
