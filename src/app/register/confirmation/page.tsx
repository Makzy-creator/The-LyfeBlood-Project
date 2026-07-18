'use client'
import { Suspense } from 'react'
import { CheckCircle2, Heart } from 'lucide-react'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { useSearchParams, useRouter } from 'next/navigation'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requiresEmailConfirmation = searchParams.get('requiresEmailConfirmation') === 'true'
  const email = searchParams.get('email')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ position: 'relative', marginBottom: '28px' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#D5F5E3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={56} color="#27AE60" strokeWidth={2} />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#C0392B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart size={22} color="#FFFFFF" fill="#FFFFFF" />
        </div>
      </div>

      <h1
        style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#1A1A1A',
          margin: '0 0 8px',
          textAlign: 'center',
        }}
      >
        Account Created!
      </h1>

      <p
        style={{
          fontSize: '14px',
          color: '#4A4A4A',
          margin: '0 0 32px',
          textAlign: 'center',
          lineHeight: '1.6',
          maxWidth: '280px',
        }}
      >
        {requiresEmailConfirmation
          ? `We've sent a confirmation email to ${email || 'your email'}. Please verify before logging in.`
          : 'Welcome to LyfeBlood. You can now sign in with your credentials.'}
      </p>

      <div style={{ width: '100%', maxWidth: '320px' }}>
        <PrimaryButton onClick={() => router.push('/login')} icon={CheckCircle2}>
          Continue to Sign In
        </PrimaryButton>
      </div>

      <p
        style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#6B6B6B',
          marginTop: '16px',
          lineHeight: '1.5',
        }}
      >
        By continuing, you acknowledge that LyfeBlood facilitates donor matching only. All clinical
        decisions remain with licensed medical staff.
      </p>
    </div>
  )
}

export default function RegistrationConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Loading...
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
