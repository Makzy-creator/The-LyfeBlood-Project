'use client'
import { useEffect, useState } from 'react'
import { Droplets, MapPin, Clock, Award, ChevronRight, X } from 'lucide-react'
import TopAppBar from '@/components/ui/TopAppBar'
import BottomNavBar from '@/components/ui/BottomNavBar'
import BloodGroupTag from '@/components/ui/BloodGroupTag'
import RequestCard from '@/components/ui/RequestCard'
import { useApp } from '@/context/AppContext'
import { apiGetMatches } from '@/utils/api'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

function normalizeAssignedMatch(match) {
  const request = match.request ?? {}
  return {
    matchId: match.id,
    id: request.id ?? match.request_id,
    tier: request.urgency_tier === 'SOS' ? 'sos' : 'standard',
    bloodGroup: request.blood_type_needed ?? null,
    unitsNeeded: request.units_needed ?? 1,
    unitsFulfilled: request.units_fulfilled ?? 0,
    hospitalName: request.hospital_name ?? 'Hospital',
    ward: request.patient_ref ?? 'Blood request',
    patientCode: request.patient_ref ?? null,
    status: 'pending',
    requestDate: match.notified_at ?? request.created_at ?? new Date().toISOString(),
    urgencyNote: request.urgency_note ?? null,
    location: request.location ?? null,
    distanceKm: match.distance_km,
  }
}

const DONATION_COOLDOWN_DAYS = 56
const MS_PER_DAY = 86_400_000

function getCooldownDaysRemaining(lastDonationAt) {
  if (!lastDonationAt) return 0
  const lastDonationTime = new Date(lastDonationAt).getTime()
  if (!Number.isFinite(lastDonationTime)) return 0
  const daysSinceDonation = (Date.now() - lastDonationTime) / MS_PER_DAY
  return Math.max(0, Math.ceil(DONATION_COOLDOWN_DAYS - daysSinceDonation))
}

function formatDonationDate(lastDonationAt) {
  if (!lastDonationAt) return 'Never'
  const date = new Date(lastDonationAt)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DonorHomePage() {
  const {
    currentUser,
    isAuthenticated,
    donorAvailable,
    toggleDonorAvailable,
    incomingMatchAlert,
    dismissMatchAlert,
    markAllNotificationsRead,
    refreshCurrentUser,
  } = useApp()

  // Auth guard
  const router = useRouter()
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const [toggling, setToggling] = useState(false)
  const [assignedMatches, setAssignedMatches] = useState([])
  const [matchesError, setMatchesError] = useState(null)
  const [rewardPoints, setRewardPoints] = useState(currentUser?.rewardPoints ?? 0)

  useEffect(() => {
    if (!isAuthenticated) return
    refreshCurrentUser?.().catch((error) => {
      console.error('[DonorHome] Failed to refresh donor profile:', error)
    })
    let alive = true
    apiGetMatches()
      .then(({ matches }) => {
        if (!alive) return
        setAssignedMatches((matches ?? []).map(normalizeAssignedMatch))
        setMatchesError(null)
      })
      .catch((error) => {
        if (!alive) return
        console.error('[DonorHome] Failed to load assigned matches:', error)
        setAssignedMatches([])
        setMatchesError(error.message ?? 'Failed to load matches')
      })
    return () => {
      alive = false
    }
  }, [isAuthenticated, refreshCurrentUser])

  useEffect(() => {
    if (!currentUser?.id) return

    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialize reward points from currentUser before fetch
    setRewardPoints(currentUser.rewardPoints ?? 0)

    supabase
      .from('users')
      .select('reward_points')
      .eq('id', currentUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return
        if (error) {
          console.error('[DonorHome] Failed to load reward points:', error)
          return
        }
        setRewardPoints(Number(data?.reward_points ?? currentUser.rewardPoints ?? 0))
      })

    return () => {
      alive = false
    }
  }, [currentUser?.id, currentUser?.rewardPoints])

  const handleToggle = async () => {
    if (isCoolingDown) return
    setToggling(true)
    await new Promise((r) => setTimeout(r, 250))
    toggleDonorAvailable()
    setToggling(false)
  }

  const activeRequests = assignedMatches
  const realIncomingMatchAlert =
    incomingMatchAlert &&
    assignedMatches.some((assignedMatch) => assignedMatch.matchId === incomingMatchAlert.matchId)
      ? incomingMatchAlert
      : null

  const handleAcceptMatch = () => {
    if (typeof window !== 'undefined' && realIncomingMatchAlert) {
      router.push(`/donor/match/${realIncomingMatchAlert.matchId}`)
    }
  }

  if (!currentUser) return null

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const lastDonationAt = currentUser.lastDonationAt ?? currentUser.lastDonated ?? null
  const lastDonationLabel = formatDonationDate(lastDonationAt)
  const cooldownDays = getCooldownDaysRemaining(lastDonationAt)
  const isCoolingDown = cooldownDays > 0
  const hasDonationHistory = Boolean(lastDonationAt) || Number(currentUser.totalDonations ?? 0) > 0

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          paddingBottom: '80px',
        }}
      >
        <TopAppBar title="LyfeBlood" onBellPress={markAllNotificationsRead} />

        {/* ── INCOMING MATCH ALERT BANNER ─────────────────────────────── */}
        {realIncomingMatchAlert && (
          <div
            style={{
              backgroundColor: '#FADBD8',
              borderBottom: '1px solid #F1948A',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideDown 0.3s ease',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#C0392B',
                flexShrink: 0,
                animation: 'pulseDot 1.2s infinite',
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#922B21',
                  margin: '0 0 2px',
                }}
              >
                🚨 Urgent Match Found
              </p>
              <p style={{ fontSize: '12px', color: '#922B21', margin: 0 }}>
                {realIncomingMatchAlert.bloodGroup} needed at {realIncomingMatchAlert.hospitalName}
              </p>
            </div>
            <button
              onClick={handleAcceptMatch}
              style={{
                backgroundColor: '#C0392B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              View →
            </button>
            <button
              onClick={dismissMatchAlert}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#922B21',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── GREETING PROFILE CARD ─────────────────────────────────── */}
        <div
          style={{
            margin: '12px 12px 0',
            background: 'linear-gradient(135deg, #922B21 0%, #C0392B 100%)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />

          {/* Name + blood group row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  margin: '0 0 3px',
                }}
              >
                {greeting},
              </p>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {currentUser.name?.split(' ')[0]} 👋
              </h2>
            </div>
            <BloodGroupTag group={currentUser.bloodGroup} size="lg" />
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            {[
              {
                icon: Award,
                label: 'Donations',
                value: currentUser.totalDonations || 0,
              },
              {
                icon: Clock,
                label: 'Last Donated',
                value: lastDonationLabel,
              },
              { icon: MapPin, label: 'Location', value: 'Owerri N.' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <Icon size={14} color="rgba(255,255,255,0.7)" style={{ marginBottom: '4px' }} />
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    margin: '0 0 1px',
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.6)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ── AVAILABILITY TOGGLE ────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  margin: '0 0 2px',
                }}
              >
                Live Availability
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                }}
              >
                {donorAvailable
                  ? isCoolingDown
                    ? 'Cooldown active. Donation actions are disabled'
                    : 'You are visible to hospitals & patients'
                  : 'You are hidden from all requests'}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              {donorAvailable && !isCoolingDown && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#D5F5E3',
                    color: '#1E8449',
                    fontSize: '10px',
                    fontWeight: '700',
                    paddingInline: '8px',
                    paddingBlock: '3px',
                    borderRadius: '999px',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#27AE60',
                      animation: 'pulseDot 1.5s infinite',
                    }}
                  />
                  Available
                </span>
              )}
              {/* Toggle switch */}
              <button
                onClick={handleToggle}
                disabled={toggling || isCoolingDown}
                aria-label="Toggle availability"
                style={{
                  width: '52px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor:
                    donorAvailable && !isCoolingDown ? '#27AE60' : 'rgba(255,255,255,0.25)',
                  border: 'none',
                  cursor: toggling || isCoolingDown ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  transition: 'background-color 250ms',
                  outline: 'none',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: donorAvailable && !isCoolingDown ? '26px' : '3px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transition: 'left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          </div>

          {hasDonationHistory && (
            <div
              style={{
                marginTop: '10px',
                backgroundColor:
                  cooldownDays > 0 ? 'rgba(250, 219, 216, 0.18)' : 'rgba(213, 245, 227, 0.16)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  margin: '0 0 2px',
                }}
              >
                56-day donation cooldown
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.72)',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {cooldownDays > 0
                  ? `${cooldownDays} day${cooldownDays === 1 ? '' : 's'} remaining before you can accept another donation.`
                  : 'Cooldown complete. You can accept assigned requests when available.'}
              </p>
            </div>
          )}
        </div>

        {/* ── ACTIVE REQUESTS ────────────────────────────────────────── */}
        <section style={{ padding: '20px 12px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1A1A1A',
                  margin: 0,
                }}
              >
                Assigned Requests
              </h2>
              <p
                style={{
                  fontSize: '11px',
                  color: '#6B6B6B',
                  margin: '2px 0 0',
                }}
              >
                Real matches assigned to you
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#C0392B',
                backgroundColor: '#FADBD8',
                paddingInline: '8px',
                paddingBlock: '3px',
                borderRadius: '999px',
              }}
            >
              {activeRequests.length} open
            </span>
          </div>

          {activeRequests.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              }}
            >
              <Droplets
                size={48}
                color="#C8C8C8"
                strokeWidth={1.5}
                style={{ marginBottom: '12px' }}
              />
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6B6B6B',
                  margin: '0 0 4px',
                  textAlign: 'center',
                }}
              >
                {matchesError ? 'Unable to load matches' : 'No assigned requests right now'}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#C8C8C8',
                  margin: 0,
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}
              >
                {matchesError ??
                  'When the backend matching engine assigns you to a request, it will appear here.'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {isCoolingDown && (
                <p
                  style={{
                    margin: 0,
                    borderRadius: '8px',
                    backgroundColor: '#FADBD8',
                    color: '#922B21',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '10px 12px',
                  }}
                >
                  Donation actions are disabled until your cooldown ends.
                </p>
              )}
              {activeRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onClick={() => {
                    if (isCoolingDown) return
                    if (typeof window !== 'undefined') {
                      router.push(`/donor/match/${req.matchId}`)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section style={{ padding: '16px 12px 0' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#C0392B" />
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>
                    Rewards
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B6B6B', margin: '2px 0 0' }}>
                    Benefits marketplace coming soon
                  </p>
                </div>
              </div>
              <span
                style={{
                  backgroundColor: '#FADBD8',
                  color: '#922B21',
                  borderRadius: '999px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  whiteSpace: 'nowrap',
                }}
              >
                Coming Soon
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ backgroundColor: '#F8F8F8', borderRadius: '8px', padding: '12px' }}>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: '#6B6B6B',
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Points
                </p>
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>
                  {rewardPoints}
                </p>
              </div>
              <div style={{ backgroundColor: '#F8F8F8', borderRadius: '8px', padding: '12px' }}>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: '#6B6B6B',
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                  }}
                >
                  History
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#4A4A4A',
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  Reward history will appear after partner rewards launch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ──────────────────────────────────────────────── */}
        <section style={{ padding: '16px 12px 0' }}>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1A1A1A',
              margin: '0 0 10px',
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Donation History', icon: Clock, href: '#' },
              { label: 'Update Profile', icon: Award, href: '/profile' },
            ].map(({ label, icon: Icon, href }) => (
              <a key={label} href={href} style={{ flex: 1, textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '14px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon size={16} color="#C0392B" />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1A1A1A',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <ChevronRight size={14} color="#C8C8C8" />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <BottomNavBar
        onNavigate={(key) => {
          if (typeof window === 'undefined') return
          if (key === 'home') router.push('/donor/home')
          if (key === 'profile') router.push('/profile')
        }}
      />

      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulseDot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
  )
}
