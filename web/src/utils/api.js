/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LyfeBlood — Unified API Client
 *
 * SWITCHING BETWEEN BACKENDS
 * ─────────────────────────────────────────────────────────────────────────
 * This app is currently deployed on the Anything platform (Next.js + Neon
 * PostgreSQL). All fetch calls use relative paths (/api/…) which resolve
 * to the bundled serverless Next.js routes.
 *
 * To switch to the Cloudflare Worker instead:
 *   1. Deploy the worker:   wrangler deploy  (from /src/worker/)
 *   2. Copy the Worker URL from the dashboard (e.g. https://lyfeblood-api.your-account.workers.dev)
 *   3. Set it as an env variable in this platform:  NEXT_PUBLIC_WORKER_URL
 *   4. Uncomment the WORKER line below and comment out the LOCAL line.
 *
 * The API surface is identical across both backends — no other code changes needed.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ── Backend selector ──────────────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_URL ?? // Cloudflare Worker (external)
  ""; // Next.js routes (same origin — default)

// ── Low-level fetch wrapper ───────────────────────────────────────────────────

const AUTH_TOKEN_STORAGE_KEY = "lyfeblood.auth.token";

function getStoredAuthToken() {
  try {
    return typeof window !== "undefined"
      ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      : null;
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getStoredAuthToken();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: "Invalid JSON response from server" };
  }

  if (!response.ok) {
    const message =
      data?.error ??
      `Request failed: ${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ full_name, email, phone, password, role, blood_type?, location? }} payload
 * @returns {{ user, message }}
 */
export async function apiRegister(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Log in with email + password.
 * @param {{ email, password }} payload
 * @returns {{ user, message }}
 */
export async function apiLogin(payload) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetProfile() {
  return apiFetch("/api/profile");
}

/**
 * Update a user profile.
 * @param {{ id: string, full_name: string, phone?: string, role: string, blood_type?: string, location?: string, availability_status?: number }} payload
 * @returns {{ user, message }}
 */
export async function apiUpdateProfile(payload) {
  return apiFetch("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ── Blood Requests ────────────────────────────────────────────────────────────

/**
 * Fetch active blood requests (non-Completed). SOS tier first.
 * @param {{ blood_type?: string, limit?: number }} params
 * @returns {{ requests: BloodRequest[] }}
 */
export async function apiGetRequests(params = {}) {
  const qs = new URLSearchParams();
  if (params.blood_type) qs.set("blood_type", params.blood_type);
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/api/requests${query}`);
}

export async function apiGetRequest(requestId) {
  return apiFetch(`/api/requests/${encodeURIComponent(requestId)}`);
}

export async function apiUpdateRequestStatus(payload) {
  return apiFetch("/api/requests", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Create a new blood request.
 * @param {{
 *   hospital_name, blood_type_needed, urgency_tier,
 *   units_needed?, patient_ref?, location?, urgency_note?, requested_by?
 * }} payload
 * @returns {{ request, message }}
 */
export async function apiCreateRequest(payload) {
  return apiFetch("/api/requests/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Matches ───────────────────────────────────────────────────────────────────

/**
 * Accept or decline a donor–request match.
 * @param {{ match_id: string, decision: 'Accepted' | 'Declined' }} payload
 * @returns {{ message, status, otp?, expires_at?, token_id? }}
 */
export async function apiGetMatches(params = {}) {
  const qs = new URLSearchParams();
  if (params.id) qs.set("id", params.id);
  if (params.request_id) qs.set("request_id", params.request_id);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/api/matches${query}`);
}

export async function apiGetMatch(matchId) {
  const { matches } = await apiGetMatches({ id: matchId });
  return { match: matches?.[0] ?? null };
}

export async function apiRespondToMatch(payload) {
  return apiFetch("/api/matches/respond", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiSendMatches(payload) {
  return apiFetch("/api/matches/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetMatchChat(matchId) {
  const qs = new URLSearchParams({ match_id: matchId });
  return apiFetch(`/api/matches/chat?${qs.toString()}`);
}

export async function apiSendMatchChatMessage(payload) {
  return apiFetch("/api/matches/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetMatchTracking(matchId) {
  const qs = new URLSearchParams({ match_id: matchId });
  return apiFetch(`/api/matches/tracking?${qs.toString()}`);
}

export async function apiUpdateMatchTracking(payload) {
  return apiFetch("/api/matches/tracking", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Check-in Tokens ───────────────────────────────────────────────────────────

/**
 * Verify a 6-digit OTP at the hospital lab.
 * Advances the associated blood_request to 'Arrived'.
 * @param {{ otp: string, match_id: string }} payload
 * @returns {{ message, token_id, request_id, checked_in_at, verified_by, new_status }}
 */
export async function apiVerifyToken(payload) {
  return apiFetch("/api/tokens/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateHospitalMatchStatus(payload) {
  return apiFetch("/api/matches/hospital-status", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function apiGetNotifications(params = {}) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.unread) qs.set("unread", "true");
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/api/notifications${query}`);
}

export async function apiUpdateNotifications(payload = {}) {
  return apiFetch("/api/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export default {
  register: apiRegister,
  login: apiLogin,
  getProfile: apiGetProfile,
  updateProfile: apiUpdateProfile,
  getRequests: apiGetRequests,
  getRequest: apiGetRequest,
  updateRequestStatus: apiUpdateRequestStatus,
  createRequest: apiCreateRequest,
  getMatches: apiGetMatches,
  getMatch: apiGetMatch,
  respondToMatch: apiRespondToMatch,
  sendMatches: apiSendMatches,
  verifyToken: apiVerifyToken,
  updateHospitalMatchStatus: apiUpdateHospitalMatchStatus,
  getNotifications: apiGetNotifications,
  updateNotifications: apiUpdateNotifications,
};
