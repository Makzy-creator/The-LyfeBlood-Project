import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '48px',
          fontWeight: '800',
          color: '#1A1A1A',
          margin: '0 0 8px',
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: '#6B6B6B',
          margin: '0 0 24px',
        }}
      >
        Page not found
      </p>
      <Link
        href="/"
        style={{
          color: '#C0392B',
          fontWeight: '700',
          textDecoration: 'none',
          fontSize: '14px',
        }}
      >
        Go Home
      </Link>
    </div>
  )
}
