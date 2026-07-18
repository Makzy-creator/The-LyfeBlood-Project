import { describe, expect, it } from 'vitest'
import { normalizeBloodTypes, requestIncludesBloodType, serializeBloodTypes } from './bloodTypes'

describe('blood type request values', () => {
  it('supports one selected blood type', () => {
    expect(serializeBloodTypes(['O+'])).toBe('O+')
  })

  it('supports several selected blood types', () => {
    expect(serializeBloodTypes(['O+', 'A-', 'B+'])).toBe('O+, A-, B+')
  })

  it('returns no selected blood types for empty input', () => {
    expect(normalizeBloodTypes([])).toEqual([])
    expect(serializeBloodTypes([])).toBe('')
  })

  it('matches when any selected type is requested', () => {
    expect(requestIncludesBloodType('O+, A-', 'A-')).toBe(true)
    expect(requestIncludesBloodType('O+, A-', 'AB+')).toBe(false)
  })

  it('keeps old single-type records compatible', () => {
    expect(normalizeBloodTypes('O+')).toEqual(['O+'])
    expect(requestIncludesBloodType('O+', 'O+')).toBe(true)
  })

  it('removes duplicate selected blood types', () => {
    expect(serializeBloodTypes(['O+', 'A-', 'O+'])).toBe('O+, A-')
  })
})
