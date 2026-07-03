import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function getSupabaseConfig() {
  return {
    url: supabaseUrl ?? null,
    anonKey: supabaseAnonKey ?? null,
    serviceRoleKey: supabaseServiceRoleKey ?? null,
  };
}

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));
}

export function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}

export function buildAuthUserPayload(authUser, fallback = {}) {
  const metadata = authUser?.user_metadata ?? {};
  const createdAt = metadata?.created_at ?? fallback.created_at ?? new Date().toISOString();

  return {
    id: authUser?.id ?? fallback.id ?? null,
    full_name: metadata?.full_name ?? fallback.full_name ?? null,
    email: authUser?.email ?? fallback.email ?? null,
    phone: metadata?.phone ?? fallback.phone ?? null,
    role: metadata?.role ?? fallback.role ?? null,
    blood_type: metadata?.blood_type ?? fallback.blood_type ?? null,
    location: metadata?.location ?? fallback.location ?? null,
    availability_status: metadata?.availability_status ?? fallback.availability_status ?? 0,
    is_verified: metadata?.is_verified ?? fallback.is_verified ?? 0,
    created_at: createdAt,
  };
}

export function createSupabaseServerClient() {
  const apiKey = supabaseAnonKey || supabaseServiceRoleKey;

  if (!supabaseUrl || !apiKey) {
    throw new Error(
      "Supabase server configuration is missing. Set SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
