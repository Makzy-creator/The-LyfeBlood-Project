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

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
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
export async function apiRespondToMatch(payload) {
  return apiFetch("/api/matches/respond", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Check-in Tokens ───────────────────────────────────────────────────────────

/**
 * Verify a 6-digit OTP at the hospital lab.
 * Advances the associated blood_request to 'Arrived'.
 * @param {{ otp: string, match_id?: string }} payload
 * @returns {{ message, token_id, request_id, new_status }}
 */
export async function apiVerifyToken(payload) {
  return apiFetch("/api/tokens/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export default {
  register: apiRegister,
  login: apiLogin,
  getRequests: apiGetRequests,
  createRequest: apiCreateRequest,
  respondToMatch: apiRespondToMatch,
  verifyToken: apiVerifyToken,
};
