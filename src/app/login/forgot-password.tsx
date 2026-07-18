'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message ?? 'Unable to process your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Forgot Password
        </h1>

        <p
          style={{
            color: '#64748b',
            marginBottom: '24px',
          }}
        >
          Enter the email address associated with your account.
        </p>

        {success ? (
          <>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                marginBottom: '20px',
              }}
            >
              If an account exists for that email, password reset instructions will be sent.
            </div>

            <button
              onClick={() => router.push('/login')}
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Back to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  color: '#dc2626',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
