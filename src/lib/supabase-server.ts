import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim()
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

export function getSupabaseConfig() {
  return {
    url: supabaseUrl ?? null,
    anonKey: supabaseAnonKey ?? null,
    serviceRoleKey: supabaseServiceRoleKey ?? null,
  }
}

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey))
}

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? ''
}

function parseCookies(cookieHeader: string) {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf('=')
      return eq === -1
        ? { name: part, value: '' }
        : { name: part.slice(0, eq), value: part.slice(eq + 1) }
    })
}

let outboundCookies: { name: string; value: string; options: Record<string, unknown> }[] = []

function createCookieHandlers(request: Request | null) {
  outboundCookies = []

  const getAll = () => {
    if (request) {
      const header = request.headers.get('cookie') ?? ''
      return parseCookies(header)
    }
    return []
  }

  const setAll = (
    cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]
  ) => {
    outboundCookies = cookiesToSet
  }

  return { getAll, setAll }
}

export function getOutboundCookies() {
  return outboundCookies
}

function createBaseClient(apiKey: string, request?: Request | null) {
  if (!supabaseUrl || !apiKey) {
    throw new Error(
      'Supabase server configuration is missing. Set SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  const { getAll, setAll } = createCookieHandlers(request ?? null)

  return createServerClient(supabaseUrl, apiKey, {
    cookies: { getAll, setAll },
  })
}

export function createSupabaseServerClient(request?: Request | null) {
  return createBaseClient(supabaseServiceRoleKey || supabaseAnonKey!, request)
}

export function createSupabaseAuthClient(request?: Request | null) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase auth configuration is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.'
    )
  }

  const { getAll, setAll } = createCookieHandlers(request ?? null)

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll, setAll },
  })
}

export function createSupabaseAdminClient(request?: Request | null) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase admin configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  const { getAll, setAll } = createCookieHandlers(request ?? null)

  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: { getAll, setAll },
  })
}
