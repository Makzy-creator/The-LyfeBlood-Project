'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ClipboardList } from 'lucide-react'
import TopAppBar from '@/components/ui/TopAppBar'
import BottomNavBar from '@/components/ui/BottomNavBar'
import RequestCard from '@/components/ui/RequestCard'
import RequestDeleteControl from '@/components/ui/RequestDeleteControl'
import { useApp } from '@/context/AppContext'
import { apiGetMatches } from '@/utils/api'
import { supabase } from '@/lib/supabase-client'

const ROLE_HOME_ROUTE = {
  donor: '/donor/home',
  requester: '/dashboard',
  patient_family: '/dashboard',
  hospital: '/hospital/dashboard',
  hospital_officer: '/hospital/dashboard',
}

function isDonorRole(role) {
  return role === 'donor'
}

function normalizeDonorMatch(match) {
  const request = match.request ?? {}
  return {
    matchId: match.id,
    id: request.id ?? match.request_id,
    tier: request.urgency_tier === 'SOS' ? 'sos' : 'standard',
    bloodGroup: request.blood_type_needed ?? null,
    unitsNeeded: request.units_needed ?? 1,
    hospitalName: request.hospital_name ?? 'Hospital',
    ward: request.patient_ref ?? 'Blood request',
    status: 'pending',
    requestDate: match.notified_at ?? request.created_at ?? new Date().toISOString(),
    urgencyNote: request.urgency_note ?? null,
  }
}

export default function RequestHistoryPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated, bloodRequests, markAllNotificationsRead, deleteRequest } =
    useApp()
  const [donorMatches, setDonorMatches] = useState([])
  const [donorMatchesError, setDonorMatchesError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  const loadDonorMatches = useCallback(async () => {
    try {
      const { matches } = await apiGetMatches()
      setDonorMatches(
        (matches ?? []).filter((match) => match.match_status === 'Alerted').map(normalizeDonorMatch)
      )
      setDonorMatchesError('')
    } catch (error) {
      setDonorMatches([])
      setDonorMatchesError(error?.message ?? 'Unable to load available requests')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'donor') return
    const initialLoad = window.setTimeout(loadDonorMatches, 0)
    const channel = supabase
      .channel(`available-donor-matches-${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `donor_id=eq.${currentUser.id}` },
        loadDonorMatches
      )
      .subscribe()
    const handleFocus = () => loadDonorMatches()
    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearTimeout(initialLoad)
      window.removeEventListener('focus', handleFocus)
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id, currentUser?.role, isAuthenticated, loadDonorMatches])

  if (!currentUser) return null

  const donor = isDonorRole(currentUser.role)
  const homeRoute = ROLE_HOME_ROUTE[currentUser.role] ?? '/dashboard'
  const visibleRequests = donor
    ? donorMatches
    : bloodRequests

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '80px' }}>
        <TopAppBar
          title={donor ? 'Available Requests' : 'Request History'}
          onBellPress={markAllNotificationsRead}
        />
        <main
          style={{
            padding: '16px 12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              width: '36px',
              height: '36px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#F4F4F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </button>

          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ClipboardList size={22} color="#C0392B" />
            <div>
              <p
                style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: '#1A1A1A' }}
              >
                {visibleRequests.length}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B', fontWeight: '700' }}>
                {donor
                  ? `request${visibleRequests.length === 1 ? '' : 's'} available for your blood group`
                  : `request${visibleRequests.length === 1 ? '' : 's'} in history`}
              </p>
            </div>
          </section>

          {visibleRequests.length === 0 ? (
            <section
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '32px 18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                textAlign: 'center',
              }}
            >
              <ClipboardList size={38} color="#C8C8C8" />
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#6B6B6B',
                }}
              >
                {donor
                  ? donorMatchesError || 'No requests have been assigned to you yet'
                  : 'No request history yet'}
              </p>
            </section>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {visibleRequests.map((request) => (
                <div
                  key={request.id}
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <RequestCard
                    request={request}
                    onClick={() =>
                      router.push(
                        donor ? `/donor/match/${request.matchId}` : `/requests/${request.id}`
                      )
                    }
                  />
                  {!donor && (
                    <RequestDeleteControl
                      request={request}
                      onDelete={() => deleteRequest(request.id)}
                      compact
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNavBar
        onNavigate={(key) => {
          if (key === 'home') router.push(homeRoute)
          if (key === 'profile') router.push('/profile')
        }}
      />
    </>
  )
}
