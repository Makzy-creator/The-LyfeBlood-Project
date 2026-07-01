/**
 * POST /api/tokens/verify
 * Body: { otp: string, match_id?: string }
 *
 * Validates the 6-digit OTP against active verification_tokens.
 * On success, advances the associated blood_request to 'Arrived' (atomic).
 *
 * Error cases:
 *   400 — OTP format invalid
 *   401 — OTP not found or already expired/used
 *   500 — DB write failure
 */
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { otp, match_id } = body;

    if (!otp || String(otp).length !== 6)
      return Response.json(
        { error: "A 6-digit OTP is required" },
        { status: 400 },
      );

    const now = new Date().toISOString();

    // ── Lazy-expire stale tokens (best-effort, non-blocking intent) ───────────
    sql`
      UPDATE verification_tokens
      SET    status = 'Expired'
      WHERE  status = 'Active' AND expires_at < ${now}
    `.catch(() => {}); // intentionally non-blocking

    // ── Look up matching active token + join request_id from matches ──────────
    let tokenRows;

    if (match_id) {
      tokenRows = await sql`
        SELECT vt.id, vt.match_id, vt.secure_otp, vt.expires_at, vt.status,
               m.request_id
        FROM   verification_tokens vt
        JOIN   matches m ON m.id = vt.match_id
        WHERE  vt.secure_otp = ${String(otp)}
          AND  vt.status     = 'Active'
          AND  vt.match_id   = ${match_id}
        LIMIT 1
      `;
    } else {
      tokenRows = await sql`
        SELECT vt.id, vt.match_id, vt.secure_otp, vt.expires_at, vt.status,
               m.request_id
        FROM   verification_tokens vt
        JOIN   matches m ON m.id = vt.match_id
        WHERE  vt.secure_otp = ${String(otp)}
          AND  vt.status     = 'Active'
        LIMIT 1
      `;
    }

    if (tokenRows.length === 0)
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 401 },
      );

    const token = tokenRows[0];

    // ── Application-layer expiry check (belt-and-suspenders) ─────────────────
    if (new Date(token.expires_at) < new Date()) {
      await sql`
        UPDATE verification_tokens SET status = 'Expired' WHERE id = ${token.id}
      `;
      return Response.json({ error: "OTP has expired" }, { status: 401 });
    }

    // ── Atomic: mark token Used + advance request to Arrived ─────────────────
    const [usedToken, arrivedRequest] = await sql.transaction([
      sql`
        UPDATE verification_tokens SET status = 'Used'
        WHERE id = ${token.id}
        RETURNING id, status
      `,
      sql`
        UPDATE blood_requests SET status = 'Arrived'
        WHERE id = ${token.request_id}
        RETURNING id, status, hospital_name, blood_type_needed
      `,
    ]);

    return Response.json({
      message: "Check-in verified. Donor arrival confirmed.",
      token_id: token.id,
      request_id: token.request_id,
      request: arrivedRequest[0] ?? null,
      new_status: "Arrived",
    });
  } catch (err) {
    console.error("[POST /api/tokens/verify]", err);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
