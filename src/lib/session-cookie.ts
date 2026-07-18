export const REMEMBER_SESSION_COOKIE = 'lyfeblood.refresh-token'
export const REMEMBER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (forwardedProto) return forwardedProto.split(',')[0]?.trim() === 'https'
  try {
    return new URL(request.url).protocol === 'https:' || process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
}

export function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return (
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? null
  )
}

export function buildRememberSessionCookie(request: Request, refreshToken: string) {
  const parts = [
    `${REMEMBER_SESSION_COOKIE}=${encodeURIComponent(refreshToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${REMEMBER_SESSION_MAX_AGE_SECONDS}`,
  ]

  if (isSecureRequest(request)) parts.push('Secure')
  return parts.join('; ')
}

export function buildClearRememberSessionCookie(request: Request) {
  const parts = [`${REMEMBER_SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']

  if (isSecureRequest(request)) parts.push('Secure')
  return parts.join('; ')
}
