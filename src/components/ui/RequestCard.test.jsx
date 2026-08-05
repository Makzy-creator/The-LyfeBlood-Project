import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RequestCard from './RequestCard'

function request(unitsNeeded) {
  return {
    id: 'request-1',
    tier: 'standard',
    bloodGroup: 'O+',
    unitsNeeded,
    unitsFulfilled: 0,
    hospitalName: 'Test Hospital',
    ward: 'Emergency',
    status: 'pending',
    requestDate: new Date().toISOString(),
  }
}

describe('RequestCard', () => {
  it('shows one requested unit without an ambiguous fulfilled fraction', () => {
    render(<RequestCard request={request(1)} />)

    expect(screen.getByText('1 unit requested')).toBeInTheDocument()
    expect(screen.queryByText('0/1 units')).not.toBeInTheDocument()
  })

  it('pluralizes requested units', () => {
    render(<RequestCard request={request(2)} />)

    expect(screen.getByText('2 units requested')).toBeInTheDocument()
  })
})
