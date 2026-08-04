import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const url = process.env.SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const accessToken = process.env.SUPABASE_TEST_ACCESS_TOKEN
const requesterId = process.env.SUPABASE_TEST_USER_ID

const integrationEnabled = Boolean(url && anonKey && serviceRoleKey && accessToken && requesterId)
const describeIntegration = integrationEnabled ? describe : describe.skip
const createdRequestIds = []

describeIntegration('create_blood_request database integration', () => {
  let userClient
  let adminClient

  beforeAll(() => {
    userClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  })

  afterAll(async () => {
    if (!createdRequestIds.length) return
    const { error } = await adminClient.from('blood_requests').delete().in('id', createdRequestIds)
    if (error) throw error
  })

  async function createRequest(overrides = {}) {
    const { data, error } = await userClient.rpc('create_blood_request', {
      p_hospital_name: 'LyfeBlood integration test',
      p_blood_type_needed: 'O+',
      p_urgency_tier: 'Standard',
      p_units_needed: 1,
      p_patient_ref: `integration-${Date.now()}`,
      p_location: 'Test location',
      p_latitude: null,
      p_longitude: null,
      p_urgency_note: null,
      p_hospital_id: null,
      p_request_type: 'Emergency',
      p_scheduled_for: null,
      ...overrides,
    })

    if (data?.id) createdRequestIds.push(data.id)
    return { data, error }
  }

  it('creates an Emergency request with canonical persisted values', async () => {
    const { data, error } = await createRequest()

    expect(error).toBeNull()
    expect(data).toMatchObject({
      requested_by: requesterId,
      blood_type_needed: 'O+',
      units_needed: 1,
      units_fulfilled: 0,
      status: 'pending',
      request_type: 'Emergency',
      scheduled_for: null,
    })
  })

  it('creates a Scheduled request with its future delivery date', async () => {
    const scheduledFor = new Date(Date.now() + 7 * 86_400_000).toISOString()
    const { data, error } = await createRequest({
      p_request_type: 'Scheduled',
      p_scheduled_for: scheduledFor,
    })

    expect(error).toBeNull()
    expect(data.request_type).toBe('Scheduled')
    expect(new Date(data.scheduled_for).toISOString()).toBe(scheduledFor)
  })

  it('rejects a Scheduled request in the past without inserting a row', async () => {
    const { data, error } = await createRequest({
      p_request_type: 'Scheduled',
      p_scheduled_for: new Date(Date.now() - 86_400_000).toISOString(),
    })

    expect(data).toBeNull()
    expect(error?.message).toContain('scheduled_for must be in the future')
  })
})
