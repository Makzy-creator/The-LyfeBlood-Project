/**
 * POST /api/matches/respond
 * Body: { match_id: string, decision: 'Accepted' | 'Declined' }
 *
 * Accepted path (atomic transaction):
 *   1. UPDATE matches.match_status → 'Accepted'
 *   2. UPDATE blood_requests.status → 'Donor Matched'
 *   3. INSERT verification_token with crypto-random 6-digit OTP + 15-min expiry
 *
 * Returns OTP + expiry on Accepted so the donor UI can render the check-in screen.
 */
import sql from "@/app/api/utils/sql";
import { randomInt } from "crypto";

/** Cryptographically secure 6-digit OTP — no Math.random() bias. */
function generateOTP() {
  return String(randomInt(100000, 1000000)); // inclusive [100000, 999999]
}

function minutesFromNow(n) {
  return new Date(Date.now() + n * 60_000).toISOString();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { match_id, decision } = body;

    if (!match_id)
      return Response.json({ error: "match_id is required" }, { status: 400 });
    if (!["Accepted", "Declined"].includes(decision))
      return Response.json(
        { error: "decision must be Accepted or Declined" },
        { status: 400 },
      );

    // ── Load the match row ────────────────────────────────────────────────────
    const rows = await sql`
      SELECT * FROM matches WHERE id = ${match_id} LIMIT 1
    `;
    if (rows.length === 0)
      return Response.json({ error: "Match not found" }, { status: 404 });

    const match = rows[0];
    if (match.match_status !== "Alerted")
      return Response.json(
        { error: "Match already responded to" },
        { status: 409 },
      );

    // ── Declined path ─────────────────────────────────────────────────────────
    if (decision === "Declined") {
      await sql`
        UPDATE matches SET match_status = 'Declined' WHERE id = ${match_id}
      `;
      return Response.json({
        message: "Match declined",
        match_id,
        status: "Declined",
      });
    }

    // ── Accepted path — three writes in a single transaction ─────────────────
    const otp = generateOTP();
    const expiresAt = minutesFromNow(15);

    const [token, updatedMatch, updatedRequest] = await sql.transaction([
      sql`
        UPDATE matches SET match_status = 'Accepted'
        WHERE id = ${match_id}
        RETURNING id, match_status
      `,
      sql`
        UPDATE blood_requests SET status = 'Donor Matched'
        WHERE id = ${match.request_id}
        RETURNING id, status
      `,
      sql`
        INSERT INTO verification_tokens (match_id, secure_otp, expires_at, status)
        VALUES (${match_id}, ${otp}, ${expiresAt}, 'Active')
        RETURNING id, match_id, secure_otp, expires_at, status
      `,
    ]);

    return Response.json({
      message: "Match accepted",
      match_id,
      status: "Accepted",
      otp, // returned to donor UI for check-in screen
      expires_at: expiresAt,
      token_id: token[0]?.id ?? null,
      request: updatedRequest[0] ?? null,
    });
  } catch (err) {
    console.error("[POST /api/matches/respond]", err);
    return Response.json({ error: "Failed to update match" }, { status: 500 });
  }
}
