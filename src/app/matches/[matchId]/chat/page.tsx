'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, MessageCircle, Navigation, Send } from 'lucide-react'
import TopAppBar from '@/components/ui/TopAppBar'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'
import { useApp } from '@/context/AppContext'
import { apiGetMatchChat, apiSendMatchChatMessage } from '@/utils/api'

const QUICK_REPLIES = [
  { quick_type: 'on_the_way', label: "I'm on my way" },
  { quick_type: 'delayed', label: "I'm delayed" },
  { quick_type: 'arrived', label: "I've arrived" },
]

export default function MatchChatPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string
  const { currentUser, isAuthenticated, markAllNotificationsRead } = useApp()
  const [messages, setMessages] = useState([])
  const [request, setRequest] = useState(null)
  const [participantRole, setParticipantRole] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const loadChat = useCallback(
    async ({ silent = false } = {}) => {
      if (!matchId) return
      if (!silent) setLoading(true)
      setError(null)
      try {
        const data = await apiGetMatchChat(matchId)
        setMessages(data.messages ?? [])
        setRequest(data.request ?? null)
        setParticipantRole(data.participant_role ?? null)
      } catch (err) {
        setError(err?.message ?? 'Unable to load chat')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [matchId]
  )

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !matchId) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadChat manages its own loading state
    loadChat()
    const interval = window.setInterval(() => loadChat({ silent: true }), 15000)
    return () => window.clearInterval(interval)
  }, [isAuthenticated, matchId, loadChat])

  const title = useMemo(() => {
    if (!request) return 'Match Chat'
    return `${request.blood_type_needed ?? 'Blood'} at ${request.hospital_name ?? 'Hospital'}`
  }, [request])

  const sendMessage = async (payload) => {
    setSending(true)
    setError(null)
    try {
      const { message } = await apiSendMatchChatMessage({
        match_id: matchId,
        ...payload,
      })
      setMessages((current) => [...current, message])
      setText('')
    } catch (err) {
      setError(err?.message ?? 'Unable to send message')
    } finally {
      setSending(false)
    }
  }

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
      <TopAppBar title="Care Chat" onBellPress={markAllNotificationsRead} />
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={18} color="#C0392B" />
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1A1A1A' }}>
                {title}
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B6B6B' }}>
                {participantRole === 'donor' ? 'Accepted donor' : 'Matched patient'}
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            flex: 1,
            minHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <p style={{ margin: 'auto', fontSize: '14px', color: '#6B6B6B', fontWeight: '600' }}>
              Loading chat...
            </p>
          ) : error ? (
            <p
              style={{
                margin: 'auto',
                fontSize: '14px',
                color: '#922B21',
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          ) : messages.length === 0 ? (
            <p
              style={{
                margin: 'auto',
                fontSize: '14px',
                color: '#6B6B6B',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              No messages yet.
            </p>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === currentUser.id
              return (
                <div
                  key={message.id}
                  style={{
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    backgroundColor: mine ? '#C0392B' : '#F4F4F4',
                    color: mine ? '#FFFFFF' : '#1A1A1A',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', lineHeight: '1.4' }}>
                    {message.message}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.72 }}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )
            })
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply.quick_type}
                onClick={() => sendMessage({ quick_type: reply.quick_type })}
                disabled={sending}
                style={{
                  minHeight: '36px',
                  flexShrink: 0,
                  border: '1px solid #F1C4BE',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#922B21',
                  fontSize: '12px',
                  fontWeight: '800',
                  paddingInline: '10px',
                  cursor: sending ? 'default' : 'pointer',
                }}
              >
                {reply.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type a message"
              maxLength={500}
              style={{
                flex: 1,
                minHeight: '44px',
                borderRadius: '8px',
                border: '1.5px solid #C8C8C8',
                paddingInline: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => sendMessage({ message: text })}
              disabled={sending || !text.trim()}
              aria-label="Send"
              style={{
                width: '48px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: text.trim() ? '#C0392B' : '#C8C8C8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: text.trim() && !sending ? 'pointer' : 'default',
              }}
            >
              <Send size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <SecondaryButton onClick={() => router.back()} icon={ChevronLeft}>
              Back
            </SecondaryButton>
            <PrimaryButton
              onClick={() => router.push(`/matches/${matchId}/tracking`)}
              icon={Navigation}
            >
              Tracking
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
