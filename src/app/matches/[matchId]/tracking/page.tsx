'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, MapPin, MessageCircle, Navigation, Radio } from 'lucide-react'
import TopAppBar from '@/components/ui/TopAppBar'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'
import DonationJourney from '@/components/ui/DonationJourney'
import { useApp } from '@/context/AppContext'
import { apiGetMatchTracking, apiUpdateMatchTracking } from '@/utils/api'

function formatDistance(value) {
  if (value === null || value === undefined) return 'Waiting'
  return `${Number(value).toFixed(1)} km`
}

function formatEta(value) {
  if (value === 0) return 'Arrived'
  if (value === null || value === undefined) return 'Waiting'
  return `${value} min`
}

function progressPercent(latestLocation, match) {
  if (latestLocation?.status === 'arrived' || match?.arrived_at) return 100
  if (match?.on_the_way_at || latestLocation) return 55
  return 15
}

export default function MatchTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string
  const { currentUser, isAuthenticated, markAllNotificationsRead } = useApp()
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadTracking = useCallback(
    async ({ silent = false } = {}) => {
      if (!matchId) return
      if (!silent) setLoading(true)
      try {
        const data = await apiGetMatchTracking(matchId)
        setTracking(data)
        setError(null)
      } catch (err) {
        setError(err?.message ?? 'Unable to load tracking')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [matchId]
  )

  const updateLocation = useCallback(
    async (status = 'on_the_way') => {
      if (!navigator.geolocation) {
        setError('Location services are not available in this browser')
        return
      }

      setUpdating(true)
      setError(null)
      setSuccess(null)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { location } = await apiUpdateMatchTracking({
              match_id: matchId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              status,
            })
            setTracking((current) => ({
              ...current,
              latest_location: location,
              locations: [location, ...(current?.locations ?? [])],
              match:
                status === 'arrived'
                  ? { ...(current?.match ?? {}), arrived_at: new Date().toISOString() }
                  : {
                      ...(current?.match ?? {}),
                      on_the_way_at: current?.match?.on_the_way_at ?? new Date().toISOString(),
                    },
            }))
            setSuccess(status === 'arrived' ? 'Arrival shared.' : 'Location updated.')
            if (status === 'arrived') setSharing(false)
          } catch (err) {
            setError(err?.message ?? 'Unable to update location')
          } finally {
            setUpdating(false)
          }
        },
        () => {
          setUpdating(false)
          setError('Location permission is required to update tracking')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
      )
    },
    [matchId]
  )

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !matchId) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadTracking manages its own loading state
    loadTracking()
    const interval = window.setInterval(() => loadTracking({ silent: true }), 15000)
    return () => window.clearInterval(interval)
  }, [isAuthenticated, matchId, loadTracking])

  useEffect(() => {
    if (!sharing) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect -- updateLocation manages its own state
    updateLocation('on_the_way')
    const interval = window.setInterval(() => updateLocation('on_the_way'), 20000)
    return () => window.clearInterval(interval)
  }, [sharing, matchId, updateLocation])

  const latestLocation = tracking?.latest_location ?? null
  const match = tracking?.match ?? null
  const request = tracking?.request ?? null
  const isDonor = tracking?.participant_role === 'donor'
  const percent = progressPercent(latestLocation, match)

  const title = useMemo(() => {
    if (!request) return 'Tracking'
    return `${request.hospital_name ?? 'Hospital'} route`
  }, [request])

  if (!currentUser) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F3F1',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopAppBar title="Donor Tracking" onBellPress={markAllNotificationsRead} />
      <div
        style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Back"
          style={{
            width: '36px',
            height: '36px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
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
            padding: '14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="#C0392B" />
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1A1A1A' }}>
                {title}
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B6B6B' }}>
                {loading
                  ? 'Loading route...'
                  : latestLocation
                    ? 'Live donor progress'
                    : 'Waiting for donor location'}
              </p>
            </div>
          </div>

          {error && (
            <p style={{ margin: 0, color: '#922B21', fontSize: '12px', fontWeight: '700' }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ margin: 0, color: '#1E8449', fontSize: '12px', fontWeight: '700' }}>
              {success}
            </p>
          )}

          <div
            style={{
              height: '220px',
              borderRadius: '8px',
              backgroundColor: '#EBF3EF',
              border: '1px solid #D8E8E0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '12%',
                right: '12%',
                top: '50%',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: '#D5DBDB',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '12%',
                top: '50%',
                width: `${Math.max(8, percent * 0.76)}%`,
                height: '8px',
                borderRadius: '999px',
                backgroundColor: '#27AE60',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `calc(12% + ${percent * 0.76}% - 12px)`,
                top: 'calc(50% - 18px)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#C0392B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              }}
            >
              <MapPin size={20} color="#FFFFFF" />
            </div>
            <span
              style={{
                position: 'absolute',
                left: '10%',
                bottom: '46px',
                fontSize: '11px',
                fontWeight: '800',
                color: '#566573',
              }}
            >
              Donor
            </span>
            <span
              style={{
                position: 'absolute',
                right: '8%',
                bottom: '46px',
                fontSize: '11px',
                fontWeight: '800',
                color: '#566573',
              }}
            >
              Hospital
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Distance', value: formatDistance(latestLocation?.distance_km) },
              { label: 'ETA', value: formatEta(latestLocation?.eta_minutes) },
              { label: 'Status', value: latestLocation?.status?.replaceAll('_', ' ') ?? 'waiting' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: '#F8F8F8',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: '0 0 3px',
                    fontSize: '10px',
                    color: '#6B6B6B',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#1A1A1A',
                    fontWeight: '800',
                    textTransform: item.label === 'Status' ? 'capitalize' : 'none',
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <DonationJourney request={request} match={match} />

        {isDonor && (
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="#C0392B" />
              <h2 style={{ margin: 0, fontSize: '15px', color: '#1A1A1A', fontWeight: '800' }}>
                Share Location
              </h2>
            </div>
            <PrimaryButton
              onClick={() => setSharing((value) => !value)}
              disabled={updating || latestLocation?.status === 'arrived'}
              icon={Navigation}
            >
              {sharing ? 'Stop Sharing' : 'Start Live Updates'}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => updateLocation('arrived')}
              disabled={updating || latestLocation?.status === 'arrived'}
              icon={MapPin}
            >
              {updating ? 'Updating...' : "I've Arrived"}
            </SecondaryButton>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B6B6B', lineHeight: '1.5' }}>
              Live updates run every 20 seconds while you are traveling and stop after arrival.
            </p>
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <SecondaryButton
            onClick={() => router.push(`/matches/${matchId}/chat`)}
            icon={MessageCircle}
          >
            Chat
          </SecondaryButton>
          {isDonor ? (
            <PrimaryButton
              onClick={() => router.push(`/donor/match/${matchId}/checkin`)}
              icon={MapPin}
            >
              Check-in OTP
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => loadTracking()} icon={Radio}>
              Refresh
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  )
}
