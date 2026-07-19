'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronLeft, CheckCircle2, Droplets, LogOut, User } from 'lucide-react'
import TopAppBar from '@/components/ui/TopAppBar'
import BottomNavBar from '@/components/ui/BottomNavBar'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'
import BloodGroupTag from '@/components/ui/BloodGroupTag'
import { useApp } from '@/context/AppContext'
import { supabase } from '@/lib/supabase-client'

const inputStyle = {
  width: '100%',
  height: '48px',
  borderRadius: '8px',
  border: '1.5px solid #C8C8C8',
  paddingInline: '14px',
  fontSize: '15px',
  color: '#1A1A1A',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const ROLE_HOME_ROUTE = {
  donor: '/donor/home',
  requester: '/dashboard',
  hospital: '/hospital/dashboard',
}

function normalizeProfileRole(role) {
  if (role === 'patient_family') return 'requester'
  if (role === 'hospital_officer') return 'hospital'
  return role ?? 'donor'
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{label}</label>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { currentUser, isAuthenticated, updateCurrentUser, markAllNotificationsRead, logout } =
    useApp()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)
  const [done, setDone] = useState(false)
  const [successMessage, setSuccessMessage] = useState('Profile updated.')
  const [roleSwitchConfirmed, setRoleSwitchConfirmed] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    bloodGroup: '',
    location: '',
    phone: '',
    role: 'donor',
    isAvailable: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!currentUser) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- form initialized from currentUser on change
    setForm({
      fullName: currentUser.name ?? '',
      bloodGroup: currentUser.bloodGroup ?? '',
      location: currentUser.location ?? '',
      phone: currentUser.phone ?? '',
      role: normalizeProfileRole(currentUser.role),
      isAvailable: !!currentUser.isAvailable,
    })
    setRoleSwitchConfirmed(false)
  }, [currentUser])

  if (!currentUser) return null

  const originalRole = normalizeProfileRole(currentUser.role)
  const isHospitalAccount = originalRole === 'hospital'
  const roleChanged = form.role !== originalRole
  const canSave =
    form.fullName.trim().length > 0 &&
    form.role &&
    (!roleChanged || roleSwitchConfirmed) &&
    (form.role !== 'donor' || !!form.bloodGroup)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError(null)
    try {
      await logout()
      // On success isAuthenticated flips to false and the guard effect above
      // redirects to /login.
    } catch (e) {
      setLogoutError(e?.message ?? 'Failed to sign out')
      setLoggingOut(false)
    }
  }

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    setError(null)
    setDone(false)
    setSuccessMessage('Profile updated.')
    try {
      const { data: user, error: updateError } = await supabase
        .from('users')
        .update({
          phone: form.phone.trim() || null,
          location: form.location.trim() || null,
          availability_status: form.isAvailable ? 1 : 0,
        })
        .eq('id', currentUser.id)
        .select(
          'id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at'
        )
        .single()

      if (updateError) throw updateError

      updateCurrentUser({
        ...user,
        name: user.full_name,
        bloodGroup: user.blood_type,
        isAvailable: !!user.availability_status,
      })

      if (roleChanged) {
        const { error: roleChangeError } = await supabase.rpc('request_role_change', {
          target_role: form.role,
        })

        if (roleChangeError) throw roleChangeError
        setSuccessMessage('Profile updated. Role change request submitted.')
      }

      setDone(true)
      setRoleSwitchConfirmed(false)
    } catch (e) {
      setError(e?.message ?? 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

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
        <TopAppBar title="Profile" onBellPress={markAllNotificationsRead} />

        <div style={{ padding: '16px 12px 20px' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F4F4F4',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </button>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <Field label="Full Name">
              <input
                style={inputStyle}
                type="text"
                value={form.fullName}
                readOnly
                aria-readonly="true"
              />
            </Field>

            <Field label="Blood Type">
              <div
                aria-readonly="true"
                style={{
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingInline: '14px',
                  border: '1.5px solid #C8C8C8',
                  borderRadius: '8px',
                  backgroundColor: '#F5F5F5',
                }}
              >
                {form.bloodGroup ? (
                  <BloodGroupTag group={form.bloodGroup} size="md" />
                ) : (
                  <span style={{ fontSize: '15px', color: '#6B7280' }}>Not provided</span>
                )}
              </div>
            </Field>

            <Field label="Location">
              <input
                style={inputStyle}
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </Field>

            <Field label="Phone / Contact">
              <input
                style={inputStyle}
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>

            <Field label="Role">
              {isHospitalAccount ? (
                <div
                  style={{
                    minHeight: '48px',
                    borderRadius: '8px',
                    border: '1.5px solid #C8C8C8',
                    padding: '12px 14px',
                    backgroundColor: '#FAFAFA',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1A1A1A',
                  }}
                >
                  Hospital
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6B6B6B',
                      lineHeight: '1.4',
                    }}
                  >
                    Hospital accounts cannot switch into donor or patient mode from profile.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                    }}
                  >
                    {[
                      { value: 'donor', label: 'Donor', Icon: Droplets },
                      {
                        value: 'requester',
                        label: 'Patient / Family',
                        Icon: User,
                      },
                    ].map(({ value, label, Icon }) => {
                      const active = form.role === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, role: value }))
                            setRoleSwitchConfirmed(false)
                            setDone(false)
                          }}
                          style={{
                            height: '48px',
                            borderRadius: '8px',
                            border: `1.5px solid ${active ? '#C0392B' : '#C8C8C8'}`,
                            backgroundColor: active ? '#FADBD8' : '#FFFFFF',
                            color: active ? '#922B21' : '#1A1A1A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {roleChanged && (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        backgroundColor: '#FFF7ED',
                        border: '1px solid #FDBA74',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={roleSwitchConfirmed}
                        onChange={(e) => setRoleSwitchConfirmed(e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#C0392B',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#9A3412',
                          lineHeight: '1.5',
                        }}
                      >
                        I understand this changes my active app mode and the screens I use after
                        saving.
                      </span>
                    </label>
                  )}
                </>
              )}
            </Field>

            {form.role === 'donor' && !form.bloodGroup && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: '#FADBD8',
                  border: '1px solid #F1948A',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}
              >
                <AlertTriangle
                  size={16}
                  color="#922B21"
                  style={{ flexShrink: 0, marginTop: '1px' }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: '#922B21',
                    fontWeight: '600',
                    lineHeight: '1.5',
                  }}
                >
                  Blood type is required before using donor mode.
                </span>
              </div>
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 12px',
                backgroundColor: '#FAFAFA',
                borderRadius: '10px',
                border: '1px solid #EFEFEF',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1A1A1A',
                }}
              >
                Availability
              </span>
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#C0392B',
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  backgroundColor: '#FADBD8',
                  border: '1px solid #F1948A',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#922B21',
                  fontWeight: '600',
                }}
              >
                {error}
              </div>
            )}

            {done && (
              <div
                style={{
                  backgroundColor: '#D5F5E3',
                  border: '1px solid #A9DFBF',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#1E8449',
                  fontWeight: '600',
                }}
              >
                {successMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <SecondaryButton onClick={() => router.back()} style={{ flex: 1 }}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={handleSave}
                disabled={!canSave || saving}
                icon={CheckCircle2}
                style={{ flex: 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </div>

            {logoutError && (
              <div
                style={{
                  backgroundColor: '#FADBD8',
                  border: '1px solid #F1948A',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#922B21',
                  fontWeight: '600',
                }}
              >
                {logoutError}
              </div>
            )}

            <SecondaryButton onClick={handleLogout} disabled={loggingOut} icon={LogOut}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </SecondaryButton>
          </div>
        </div>
      </div>

      <BottomNavBar
        onNavigate={(key) => {
          if (key === 'home')
            router.push(ROLE_HOME_ROUTE[normalizeProfileRole(currentUser.role)] ?? '/dashboard')
          if (key === 'profile') router.push('/profile')
        }}
      />
    </>
  )
}
