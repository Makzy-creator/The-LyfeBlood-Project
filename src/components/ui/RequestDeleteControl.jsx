'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export const REQUEST_DELETE_AFTER_MS = 24 * 60 * 60 * 1000

export function canDeleteRequest(request, now = Date.now()) {
  const createdAt = new Date(request?.requestDate).getTime()
  return Number.isFinite(createdAt) && now - createdAt >= REQUEST_DELETE_AFTER_MS
}

export default function RequestDeleteControl({ request, onDelete, compact = false }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const eligible = canDeleteRequest(request)

  const handleDelete = async () => {
    if (!eligible || deleting) return
    if (!window.confirm('Delete this request permanently?')) return

    setDeleting(true)
    setError('')
    try {
      await onDelete(request)
    } catch (deleteError) {
      setError(deleteError?.message ?? 'Unable to delete request.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={!eligible || deleting}
        aria-label={eligible ? 'Delete request' : 'Delete request available after 24 hours'}
        title={eligible ? 'Delete request' : 'Requests can be deleted after 24 hours'}
        style={{
          minHeight: compact ? '36px' : '42px',
          padding: compact ? '7px 10px' : '9px 12px',
          borderRadius: '8px',
          border: `1px solid ${eligible ? '#F1948A' : '#D5D5D5'}`,
          backgroundColor: eligible ? '#FFFFFF' : '#F4F4F4',
          color: eligible ? '#922B21' : '#777777',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          cursor: eligible && !deleting ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          fontSize: compact ? '11px' : '13px',
          fontWeight: '700',
        }}
      >
        <Trash2 size={compact ? 14 : 16} />
        {deleting ? 'Deleting...' : eligible ? 'Delete request' : 'Delete available after 24 hours'}
      </button>
      {error && (
        <span role="alert" style={{ fontSize: '11px', color: '#922B21', fontWeight: '700' }}>
          {error}
        </span>
      )}
    </div>
  )
}
