'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  Droplets,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'
import BloodGroupTag from '@/components/ui/BloodGroupTag'
import { BLOOD_GROUPS } from '@/context/AppContext'
import { apiRegister } from '@/utils/api'
import { supabase } from '@/lib/supabase-client'

const ROLE_META = {
  donor: {
    label: 'Blood Donor',
    icon: Droplets,
    color: '#C0392B',
    tint: '#FADBD8',
  },
  requester: {
    label: 'Patient / Family',
    icon: User,
    color: '#1E40AF',
    tint: '#DBEAFE',
  },
  hospital: {
    label: 'Hospital Officer',
    icon: Building2,
    color: '#5B21B6',
    tint: '#EDE9FE',
  },
}

const TOTAL_STEPS = 3

// ─── SHARED FIELD COMPONENT ───────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>
        {label}
        {required && <span style={{ color: '#C0392B', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

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
  transition: 'border-color 150ms',
}

// ─── STEP INDICATORS ──────────────────────────────────────────────────────────
function StepBar({ current, role }) {
  const meta = ROLE_META[role] || ROLE_META.donor
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '28px',
      }}
    >
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const done = i < current - 1
        const active = i === current - 1
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: i < TOTAL_STEPS - 1 ? 1 : 'none',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: done ? '#27AE60' : active ? meta.color : '#F4F4F4',
                border: done || active ? 'none' : '2px solid #C8C8C8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 200ms',
              }}
            >
              {done ? (
                <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: active ? '#FFFFFF' : '#6B6B6B',
                  }}
                >
                  {i + 1}
                </span>
              )}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: done ? '#27AE60' : '#E0E0E0',
                  borderRadius: '1px',
                  transition: 'background-color 300ms',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── STEP 1: ACCOUNT CREDENTIALS ─────────────────────────────────────────────
function Step1({ form, setForm }) {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}
        >
          Account Credentials
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Create your secure LyfeBlood account.
        </p>
      </div>

      <Field label="Full Name" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Chukwuemeka Obi"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
      </Field>

      <Field label="Email Address" required>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </Field>

      <Field label="Phone Number" required>
        <input
          style={inputStyle}
          type="tel"
          placeholder="+234 800 000 0000"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </Field>

      <Field label="Password" required>
        <div style={{ position: 'relative' }}>
          <input
            style={{ ...inputStyle, paddingRight: '44px' }}
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            aria-label={showPw ? 'Hide password' : 'Show password'}
            aria-pressed={showPw}
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B6B6B',
              padding: '10px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <Field label="Confirm Password" required>
        <div style={{ position: 'relative' }}>
          <input
            style={{
              ...inputStyle,
              paddingRight: '44px',
              borderColor:
                form.confirmPassword && form.confirmPassword !== form.password
                  ? '#C0392B'
                  : '#C8C8C8',
            }}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
          <button
            type="button"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            aria-pressed={showConfirm}
            onClick={() => setShowConfirm((v) => !v)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B6B6B',
              padding: '10px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {form.confirmPassword && form.confirmPassword !== form.password && (
          <span style={{ fontSize: '11px', color: '#C0392B' }}>Passwords do not match.</span>
        )}
      </Field>
    </div>
  )
}

// ─── STEP 2 DONOR: BLOOD GROUP + AGE + CITY ──────────────────────────────────
function Step2Donor({ form, setForm }) {
  const ageNum = parseInt(form.age, 10)
  const ageValid = !form.age || (ageNum >= 18 && ageNum <= 55)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}
        >
          Donor Profile
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Tell us about your blood type and location.
        </p>
      </div>

      <Field label="Blood Group" required>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '2px',
          }}
        >
          {BLOOD_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((f) => ({ ...f, bloodGroup: g }))}
              style={{
                background: 'none',
                border: `2px solid ${form.bloodGroup === g ? '#C0392B' : '#C8C8C8'}`,
                borderRadius: '8px',
                padding: '0',
                cursor: 'pointer',
                outline: 'none',
                transform: form.bloodGroup === g ? 'scale(1.06)' : 'scale(1)',
                transition: 'border-color 150ms, transform 150ms',
                boxShadow: form.bloodGroup === g ? '0 0 0 3px #FADBD8' : 'none',
              }}
            >
              <BloodGroupTag group={g} size="lg" />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Age" required>
        <input
          style={{
            ...inputStyle,
            borderColor: form.age && !ageValid ? '#C0392B' : '#C8C8C8',
            width: '120px',
          }}
          type="number"
          min="18"
          max="55"
          placeholder="e.g. 28"
          value={form.age}
          onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
        />
        {form.age && !ageValid && (
          <span style={{ fontSize: '11px', color: '#C0392B' }}>
            Donors must be between 18 and 55 years old.
          </span>
        )}
        {!form.age && (
          <span style={{ fontSize: '11px', color: '#6B6B6B' }}>Must be between 18 – 55 years.</span>
        )}
      </Field>

      <Field label="City / Local Government Area" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Owerri North, Imo State"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
      </Field>
    </div>
  )
}

// ─── STEP 2 REQUESTER: PATIENT DETAILS ───────────────────────────────────────
function Step2Requester({ form, setForm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}
        >
          Patient Details
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Tell us about the patient you're requesting blood for.
        </p>
      </div>

      <Field label="Patient Full Name" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Mr. Emeka Obi"
          value={form.patientName}
          onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
        />
      </Field>

      <Field label="Your Relationship to Patient" required>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={form.relationship}
          onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
        >
          <option value="">Select relationship</option>
          <option>Spouse</option>
          <option>Parent</option>
          <option>Child</option>
          <option>Sibling</option>
          <option>Extended Family</option>
          <option>Friend / Colleague</option>
          <option>Other</option>
        </select>
      </Field>

      <Field label="Blood Group Needed" required>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '2px',
          }}
        >
          {BLOOD_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((f) => ({ ...f, bloodGroup: g }))}
              style={{
                background: 'none',
                border: `2px solid ${form.bloodGroup === g ? '#1E40AF' : '#C8C8C8'}`,
                borderRadius: '8px',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                transform: form.bloodGroup === g ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 150ms',
                boxShadow: form.bloodGroup === g ? '0 0 0 3px #DBEAFE' : 'none',
              }}
            >
              <BloodGroupTag group={g} size="lg" />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Hospital / Location" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. St. David's Hospital, Owerri"
          value={form.hospital}
          onChange={(e) => setForm((f) => ({ ...f, hospital: e.target.value }))}
        />
      </Field>
    </div>
  )
}

// ─── STEP 2 HOSPITAL: FACILITY DETAILS ───────────────────────────────────────
function Step2Hospital({ form, setForm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}
        >
          Facility Details
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Provide your hospital's official information.
        </p>
      </div>

      <Field label="Hospital / Facility Name" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Federal Medical Centre Owerri"
          value={form.hospitalName}
          onChange={(e) => setForm((f) => ({ ...f, hospitalName: e.target.value }))}
        />
      </Field>

      <Field label="Department" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Blood Bank & Procurement"
          value={form.department}
          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
        />
      </Field>

      <Field label="Full Address" required>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Orlu Road, Owerri Municipal"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </Field>

      <Field label="Facility Type" required>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={form.facilityType}
          onChange={(e) => setForm((f) => ({ ...f, facilityType: e.target.value }))}
        >
          <option value="">Select type</option>
          <option>Federal Teaching / Medical Centre</option>
          <option>State General Hospital</option>
          <option>Private Hospital / Clinic</option>
          <option>Mission / Faith-based Hospital</option>
          <option>Primary Health Centre</option>
        </select>
      </Field>
    </div>
  )
}

// ─── STEP 3 DONOR: KYC UPLOAD ─────────────────────────────────────────────────
function Step3Donor({ form, setForm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}
        >
          Donor Declaration
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Confirm your eligibility before creating your donor profile.
        </p>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.donorDeclaration}
          onChange={(e) => setForm((f) => ({ ...f, donorDeclaration: e.target.checked }))}
          style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#C0392B' }}
        />
        <span style={{ fontSize: '13px', color: '#4A4A4A', lineHeight: '1.5' }}>
          I confirm that the information provided is accurate and understand that final identity and
          medical eligibility checks take place at the hospital before donation.
        </span>
      </label>

      <div
        style={{
          backgroundColor: '#FADBD8',
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '18px', lineHeight: 1 }}>🔒</span>
        <p
          style={{
            fontSize: '12px',
            color: '#922B21',
            margin: 0,
            lineHeight: '1.5',
          }}
        >
          LyfeBlood does not collect identity documents during registration. Bring a valid ID to the
          hospital when attending a donation appointment.
        </p>
      </div>
    </div>
  )
}

// ─── STEP 3 REQUESTER/HOSPITAL: DECLARATION ──────────────────────────────────
function Step3Declaration({ form, setForm, role }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}
        >
          {role === 'hospital' ? 'Licence & Declaration' : 'Declaration'}
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          Final step before your account is created.
        </p>
      </div>

      {role === 'hospital' && (
        <Field label="HEFAMAA / State Ministry Licence Number" required>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. IMO/HEFA/2024/00142"
            value={form.licenceNumber}
            onChange={(e) => setForm((f) => ({ ...f, licenceNumber: e.target.value }))}
          />
          <span style={{ fontSize: '11px', color: '#6B6B6B' }}>
            Issued by the Imo State Ministry of Health.
          </span>
        </Field>
      )}

      {[
        role === 'hospital'
          ? 'I confirm this facility is a licensed medical institution operating legally in Imo State.'
          : 'I confirm that the patient information provided is accurate to the best of my knowledge.',
        'I understand that LyfeBlood facilitates donor connections only — all clinical and transfusion decisions remain with licensed medical professionals.',
        'I agree to the LyfeBlood Terms of Service and Community Safety Guidelines.',
      ].map((text, i) => (
        <label
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={!!form.declarations?.[i]}
            onChange={(e) => {
              const d = [...(form.declarations || [false, false, false])]
              d[i] = e.target.checked
              setForm((f) => ({ ...f, declarations: d }))
            }}
            style={{
              width: '18px',
              height: '18px',
              marginTop: '2px',
              accentColor: '#C0392B',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '13px', color: '#4A4A4A', lineHeight: '1.5' }}>{text}</span>
        </label>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState('donor')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    age: '',
    city: '',
    patientName: '',
    relationship: '',
    hospital: '',
    hospitalName: '',
    department: '',
    address: '',
    facilityType: '',
    licenceNumber: '',
    donorDeclaration: false,
    declarations: [false, false, false],
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const r = params.get('role')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL param initializes role state at mount
      if (r && ROLE_META[r]) setRole(r)
    }
  }, [])

  const meta = ROLE_META[role]

  const getRegistrationErrorMessage = (error) => {
    const message =
      typeof error?.message === 'string' ? error.message : 'Registration failed. Please try again.'

    if (message.toLowerCase().includes('database error saving new user')) {
      return 'Registration failed while creating your profile. Please apply the latest Supabase migration, then try again.'
    }

    return message
  }

  const getValidationErrors = () => {
    const errors = []
    if (step === 1) {
      if (!form.fullName.trim()) errors.push('Enter your full name.')
      if (!form.email.trim()) errors.push('Enter your email address.')
      if (!form.phone.trim()) errors.push('Enter your phone number.')
      if (form.password.length < 8) errors.push('Use a password with at least 8 characters.')
      if (form.password !== form.confirmPassword) errors.push('Make sure both passwords match.')
    }
    if (step === 2) {
      if (role === 'donor') {
        if (!form.bloodGroup) errors.push('Select your blood group.')
        if (!form.age || parseInt(form.age, 10) < 18 || parseInt(form.age, 10) > 55)
          errors.push('Enter an eligible donor age between 18 and 55.')
        if (!form.city.trim()) errors.push('Enter your city or local government area.')
      }
      if (role === 'requester') {
        if (!form.patientName.trim()) errors.push("Enter the patient's full name.")
        if (!form.relationship) errors.push('Select your relationship to the patient.')
        if (!form.bloodGroup) errors.push('Select the blood group needed.')
        if (!form.hospital.trim()) errors.push('Enter the hospital or location.')
      }
      if (role === 'hospital') {
        if (!form.hospitalName.trim()) errors.push('Enter the facility name.')
        if (!form.department.trim()) errors.push('Enter your department.')
        if (!form.address.trim()) errors.push('Enter the facility address.')
        if (!form.facilityType) errors.push('Select the facility type.')
      }
    }
    if (step === 3) {
      if (role === 'donor' && !form.donorDeclaration)
        errors.push('Confirm the donor declaration before creating your account.')
      if (role !== 'donor' && !form.declarations?.every(Boolean))
        errors.push('Accept all declarations before creating your account.')
      if (role === 'hospital' && !form.licenceNumber.trim())
        errors.push('Enter the facility licence number.')
    }
    return errors
  }

  const handleNext = async () => {
    const validationErrors = getValidationErrors()
    if (validationErrors.length) {
      setApiError(validationErrors.join(' '))
      return
    }

    setApiError(null)
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
      return
    }
    // ── Final step: POST to live API ───────────────────────────────────────
    setSubmitting(true)
    setApiError(null)
    try {
      const {
        session,
        requiresEmailConfirmation,
        email: registeredEmail,
      } = await apiRegister({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: role === 'requester' ? 'requester' : role === 'hospital' ? 'hospital' : 'donor',
        blood_type: form.bloodGroup || null,
        location: form.city || form.address || null,
        registration_details:
          role === 'requester'
            ? {
                patient_name: form.patientName,
                relationship: form.relationship,
                hospital: form.hospital,
                declarations_accepted: true,
              }
            : role === 'hospital'
              ? {
                  hospital_name: form.hospitalName,
                  department: form.department,
                  facility_type: form.facilityType,
                  licence_number: form.licenceNumber,
                  declarations_accepted: true,
                }
              : { donor_declaration_accepted: true },
      })
      // API succeeded — navigate to confirmation
      if (session?.access_token && session?.refresh_token) {
        try {
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          })
        } catch (sessionError) {
          console.warn(
            'Account created, but the browser session could not be initialized.',
            sessionError
          )
        }
      }
      router.push(
        `/register/confirmation?requiresEmailConfirmation=${requiresEmailConfirmation}&email=${encodeURIComponent(registeredEmail ?? form.email)}`
      )
    } catch (e) {
      setApiError(getRegistrationErrorMessage(e))
      setSubmitting(false)
      return
    }
    setSubmitting(false)
  }

  const handleBack = () => {
    setApiError(null)
    if (step > 1) setStep((s) => s - 1)
    else router.push('/login')
  }

  const ctaLabel = submitting
    ? 'Creating Account…'
    : step === TOTAL_STEPS
      ? 'Create Account'
      : 'Continue'

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '100vh',
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header
          style={{
            height: '56px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #C8C8C8',
            display: 'flex',
            alignItems: 'center',
            paddingInline: '16px',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleBack}
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
            }}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </button>
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#1A1A1A',
              }}
            >
              Create Account
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: meta.color,
              backgroundColor: meta.tint,
              paddingInline: '10px',
              paddingBlock: '4px',
              borderRadius: '999px',
            }}
          >
            {meta.label}
          </span>
        </header>

        {/* ── ROLE SWITCHER (only when no query param provided) ─────── */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #C8C8C8',
          }}
        >
          {Object.entries(ROLE_META).map(([key, m]) => {
            const Icon = m.icon
            const active = role === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setRole(key)
                  setStep(1)
                  setApiError(null)
                  window.history.replaceState({}, '', `/register?role=${key}`)
                }}
                style={{
                  flex: 1,
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: `2.5px solid ${active ? m.color : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  paddingBottom: '2px',
                }}
              >
                <Icon size={14} color={active ? m.color : '#6B6B6B'} />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: active ? '700' : '500',
                    color: active ? m.color : '#6B6B6B',
                  }}
                >
                  {m.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── BODY ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '24px 16px 100px', overflowY: 'auto' }}>
          <StepBar current={step} role={role} />

          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && role === 'donor' && <Step2Donor form={form} setForm={setForm} />}
          {step === 2 && role === 'requester' && <Step2Requester form={form} setForm={setForm} />}
          {step === 2 && role === 'hospital' && <Step2Hospital form={form} setForm={setForm} />}
          {step === 3 && role === 'donor' && <Step3Donor form={form} setForm={setForm} />}
          {step === 3 && (role === 'requester' || role === 'hospital') && (
            <Step3Declaration form={form} setForm={setForm} role={role} />
          )}

          {/* ── API Error banner ──────────────────────────────────── */}
          {apiError && (
            <div
              style={{
                marginTop: '16px',
                backgroundColor: '#FADBD8',
                border: '1px solid #F1948A',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#922B21',
                fontWeight: '600',
                lineHeight: '1.5',
              }}
            >
              {apiError}
            </div>
          )}
        </div>

        {/* ── STICKY FOOTER ACTIONS ────────────────────────────────── */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 40,
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #C8C8C8',
            padding: '14px 16px',
            display: 'flex',
            gap: '10px',
            boxSizing: 'border-box',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {step > 1 && (
            <SecondaryButton onClick={handleBack} style={{ width: '80px', flexShrink: 0 }}>
              Back
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={handleNext}
            disabled={submitting}
            icon={step === TOTAL_STEPS ? CheckCircle2 : ChevronRight}
            style={{ flex: 1 }}
          >
            {ctaLabel}
          </PrimaryButton>
        </div>
      </div>
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        body {
          margin: 0;
          padding: 0;
        }
        input:focus,
        select:focus {
          border-color: #c0392b !important;
          box-shadow: 0 0 0 3px #fadbd8;
        }
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
      `}</style>
    </>
  )
}
