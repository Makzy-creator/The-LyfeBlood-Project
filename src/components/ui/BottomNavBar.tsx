'use client'
import { Home, Droplets, ClipboardList, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'

const NAV_ITEMS = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'donate', label: 'Donate', Icon: Droplets },
  { key: 'requests', label: 'Requests', Icon: ClipboardList },
  { key: 'profile', label: 'Profile', Icon: User },
]

export default function BottomNavBar({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const { activeNav, setActiveNav } = useApp()
  const router = useRouter()

  const handlePress = (key: string) => {
    setActiveNav(key)
    if (key === 'donate') {
      router.push('/donations/history')
      return
    }
    if (key === 'requests') {
      router.push('/requests/history')
      return
    }
    onNavigate?.(key)
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 'var(--lb-frame-max-width, 480px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #C8C8C8',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 100,
        boxSizing: 'border-box',
      }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = activeNav === key
        return (
          <button
            key={key}
            onClick={() => handlePress(key)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              height: '64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              paddingBlock: '10px',
              position: 'relative',
              transition: 'background-color 150ms',
            }}
          >
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '28px',
                  height: '2px',
                  backgroundColor: '#C0392B',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.7}
              color={isActive ? '#C0392B' : '#6B6B6B'}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? '700' : '400',
                color: isActive ? '#C0392B' : '#6B6B6B',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
