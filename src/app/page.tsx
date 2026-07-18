'use client'
import { useState } from 'react'
import {
  Heart,
  Droplets,
  AlertTriangle,
  Users,
  ChevronRight,
  ArrowRight,
  Shield,
} from 'lucide-react'
import PrimaryButton from '@/components/ui/PrimaryButton'
import RequestCard from '@/components/ui/RequestCard'
import BloodGroupTag from '@/components/ui/BloodGroupTag'
import { useApp } from '@/context/AppContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const STATS = [
  {
    value: '47%',
    label: 'Blood shortage rate\nin Southeast Nigeria',
    icon: AlertTriangle,
    color: '#C0392B',
  },
  {
    value: '3 min',
    label: 'Avg. donor match\nresponse time',
    icon: Heart,
    color: '#27AE60',
  },
  {
    value: '1,200+',
    label: 'Registered donors\nacross Imo State',
    icon: Users,
    color: '#1A1A1A',
  },
]

export default function LandingPage() {
  const { bloodRequests } = useApp()
  const [showAll, setShowAll] = useState(false)
  const visibleRequests = showAll ? bloodRequests : bloodRequests.slice(0, 2)

  return (
    <>
      {/* ── PAGE SHELL — lb-frame in layout handles centering & max-width ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #C8C8C8',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: '20px',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
            }}
          >
            <span style={{ color: '#C0392B' }}>Lyfe</span>
            <span style={{ color: '#1A1A1A' }}>Blood</span>
          </span>
          <a
            href="/login"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#C0392B',
              textDecoration: 'none',
              padding: '6px 14px',
              border: '1.5px solid #C0392B',
              borderRadius: '8px',
            }}
          >
            Sign In
          </a>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'linear-gradient(160deg, #922B21 0%, #C0392B 55%, #E74C3C 100%)',
            padding: '40px 20px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-30px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.04)',
            }}
          />

          {/* SOS Banner */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '999px',
              paddingInline: '12px',
              paddingBlock: '5px',
              marginBottom: '18px',
            }}
          >
            <span
              style={{
                fontSize: '8px',
                color: '#FFFFFF',
                fontWeight: '800',
                letterSpacing: '0.12em',
              }}
            >
              LIVE
            </span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                color: '#FFFFFF',
                fontWeight: '600',
              }}
            >
              3 active blood requests in Owerri
            </span>
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#FFFFFF',
              lineHeight: '1.18',
              letterSpacing: '-0.03em',
              margin: '0 0 12px',
            }}
          >
            Every Drop
            <br />
            Saves a Life.
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.6',
              margin: '0 0 28px',
              maxWidth: '320px',
            }}
          >
            Connecting blood donors directly with patients and hospitals across Owerri and Imo State
            — in minutes, not hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: '#FFFFFF',
                  color: '#C0392B',
                  fontSize: '15px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em',
                }}
              >
                <Droplets size={18} color="#C0392B" />
                Find Blood Now
              </button>
            </a>
            <a href="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Heart size={18} color="#FFFFFF" />
                Become a Donor
              </button>
            </a>
          </div>
        </section>

        {/* ── STATS ROW ─────────────────────────────────────────────── */}
        <section
          style={{
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div
                key={value}
                style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                  gap: '5px',
                }}
              >
                <Icon size={16} color={color} strokeWidth={2} />
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#1A1A1A',
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#4A4A4A',
                    lineHeight: '1.35',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ───────────────────────────────────────────────── */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#C8C8C8',
            marginInline: '16px',
          }}
        />

        {/* ── ACTIVE REQUESTS ───────────────────────────────────────── */}
        <section style={{ padding: '20px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1A1A1A',
                  margin: 0,
                }}
              >
                Active Requests
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6B6B6B',
                  margin: '2px 0 0',
                }}
              >
                Owerri & surroundings · updated live
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
              {bloodRequests.length} open
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visibleRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onClick={() => {
                  window.location.href = '/login'
                }}
              />
            ))}
          </div>

          {bloodRequests.length > 2 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{
                width: '100%',
                marginTop: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                color: '#C0392B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px',
              }}
            >
              {showAll ? 'Show less' : `View all ${bloodRequests.length} requests`}
              <ChevronRight size={14} />
            </button>
          )}
        </section>

        {/* ── BLOOD GROUP FINDER ────────────────────────────────────── */}
        <section
          style={{
            margin: '0 16px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '18px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1A1A1A',
              margin: '0 0 4px',
            }}
          >
            Search by Blood Group
          </h2>
          <p style={{ fontSize: '12px', color: '#6B6B6B', margin: '0 0 14px' }}>
            Tap a group to view active donors
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {BLOOD_GROUPS.map((g) => (
              <a key={g} href="/login" style={{ textDecoration: 'none' }}>
                <BloodGroupTag group={g} size="lg" />
              </a>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <section style={{ padding: '0 16px 20px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1A1A1A',
              margin: '0 0 14px',
            }}
          >
            How LyfeBlood Works
          </h2>
          {[
            {
              step: '01',
              title: 'Post a Request',
              body: 'Hospital officers or patient families log an urgent blood need.',
              color: '#FADBD8',
              textColor: '#922B21',
            },
            {
              step: '02',
              title: 'Donors are Notified',
              body: 'Nearby registered donors matching the blood group get an instant alert.',
              color: '#D5F5E3',
              textColor: '#1E8449',
            },
            {
              step: '03',
              title: 'Match & Arrive',
              body: 'A donor confirms, travels to the hospital lab, and donation is completed.',
              color: '#DBEAFE',
              textColor: '#1E40AF',
            },
          ].map(({ step, title, body, color, textColor }) => (
            <div
              key={step}
              style={{
                display: 'flex',
                gap: '14px',
                marginBottom: '16px',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '999px',
                  backgroundColor: color,
                  color: textColor,
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step}
              </span>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1A1A1A',
                    margin: '0 0 2px',
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#4A4A4A',
                    margin: 0,
                    lineHeight: '1.5',
                  }}
                >
                  {body}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ── TRUST / SAFETY NOTICE ─────────────────────────────────── */}
        <section
          style={{
            margin: '0 16px 20px',
            backgroundColor: '#FADBD8',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <Shield size={22} color="#922B21" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#922B21',
                margin: '0 0 3px',
              }}
            >
              Safety & Compliance
            </p>
            <p
              style={{
                fontSize: '12px',
                color: '#922B21',
                margin: 0,
                lineHeight: '1.5',
                opacity: 0.85,
              }}
            >
              LyfeBlood facilitates donor–hospital connections only. All clinical screening,
              compatibility testing, and transfusion decisions are performed exclusively by licensed
              medical professionals.
            </p>
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
        <section
          style={{
            padding: '0 16px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <a href="/login" style={{ textDecoration: 'none' }}>
            <PrimaryButton icon={ArrowRight}>Get Started — It's Free</PrimaryButton>
          </a>
          <p
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#6B6B6B',
              margin: '4px 0 0',
            }}
          >
            Serving Owerri, Orlu, Okigwe & all Imo State LGAs
          </p>
        </section>
      </div>

      {/* ── GLOBAL ANIMATION ──────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.85);
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
