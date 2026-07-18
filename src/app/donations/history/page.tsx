'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, ChevronLeft, Clock, Droplets } from 'lucide-react'
import TopAppBar from '@/components/ui/TopAppBar'
import BottomNavBar from '@/components/ui/BottomNavBar'
import RequestStatusBadge from '@/components/ui/RequestStatusBadge'
import { useApp } from '@/context/AppContext'
import { apiGetMatches } from '@/utils/api'

const ROLE_HOME_ROUTE = {
  donor: '/donor/home',
  requester: '/dashboard',
  patient_family: '/dashboard',
  hospital: '/hospital/dashboard',
  hospital_officer: '/hospital/dashboard',
}

function formatDate(value) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Not recorded'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DonationHistoryPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated, markAllNotificationsRead } = useApp()
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state set before async fetch
    setLoading(true)
    apiGetMatches()
      .then(({ matches: rows }) => {
        if (!alive) return
        setMatches((rows ?? []).filter((match) => match.donation_completed_at))
        setError(null)
      })
      .catch((err) => {
        if (!alive) return
        setMatches([])
        setError(err?.message ?? 'Unable to load donation history.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [isAuthenticated])

  if (!currentUser) return null

  const homeRoute = ROLE_HOME_ROUTE[currentUser.role] ?? '/dashboard'

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '80px' }}>
        <TopAppBar title="Donation History" onBellPress={markAllNotificationsRead} />
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
            <Award size={22} color="#C0392B" />
            <div>
              <p
                style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: '#1A1A1A' }}
              >
                {matches.length}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B', fontWeight: '700' }}>
                completed donation{matches.length === 1 ? '' : 's'}
              </p>
            </div>
          </section>

          {loading && (
            <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>
              Loading donation history...
            </p>
          )}
          {error && (
            <p style={{ margin: 0, color: '#922B21', fontSize: '13px', fontWeight: '700' }}>
              {error}
            </p>
          )}

          {!loading && !error && matches.length === 0 && (
            <section
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '32px 18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                textAlign: 'center',
              }}
            >
              <Droplets size={38} color="#C8C8C8" />
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#6B6B6B',
                }}
              >
                No completed donations yet
              </p>
            </section>
          )}

          {matches.map((match) => (
            <section
              key={match.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 3px',
                      fontSize: '14px',
                      fontWeight: '800',
                      color: '#1A1A1A',
                    }}
                  >
                    {match.request?.hospital_name ?? 'Blood request'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B6B6B' }}>
                    {match.request?.blood_type_needed ?? 'Blood'} donation
                  </p>
                </div>
                <RequestStatusBadge status="fulfilled" size="sm" />
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  color: '#4A4A4A',
                }}
              >
                <Clock size={13} color="#6B6B6B" />
                {formatDate(match.donation_completed_at)}
              </span>
            </section>
          ))}
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
