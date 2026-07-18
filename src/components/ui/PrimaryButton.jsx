'use client'
import { useState } from 'react'

/**
 * PrimaryButton
 * min-height 52px (auto-expands if label wraps) · full-width
 * #C0392B bg · white text · Pressed → #922B21 · scale(0.98)
 */
export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  icon: Icon,
  style = {},
}) {
  const [pressed, setPressed] = useState(false)

  const base = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    minHeight: '52px',
    height: 'auto',
    paddingBlock: '14px',
    paddingInline: '16px',
    backgroundColor: pressed ? '#922B21' : '#C0392B',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'inherit',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transform: pressed ? 'scale(0.98)' : 'scale(1)',
    transition: 'background-color 120ms ease, transform 100ms ease',
    letterSpacing: '0.01em',
    lineHeight: '1.3',
    textAlign: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxSizing: 'border-box',
    ...style,
  }

  return (
    <button
      type={type}
      disabled={disabled}
      style={base}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
    >
      {Icon && <Icon size={18} strokeWidth={2.2} />}
      {children}
    </button>
  )
}
