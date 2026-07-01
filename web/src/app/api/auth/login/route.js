/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, message }
 *
 * Mirrors the Cloudflare Worker handler — same response shape.
 */
import sql from "@/app/api/utils/sql";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getBypassUser } from "../bypass-store";

const scryptAsync = promisify(scrypt);

async function verifyPassword(password, stored) {
  try {
    const [salt, hashHex] = stored.split("$");
    if (!salt || !hashHex) return false;
    const derived = await scryptAsync(password, salt, 64);
    const storedBuf = Buffer.from(hashHex, "hex");
    return timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password)
      return Response.json(
        { error: "email and password are required" },
        { status: 400 },
      );

    const normalizedEmail = email.trim().toLowerCase();

    // Dev bypass: if BYPASS_REGISTER_DB is set, accept in-memory users
    if (process.env.BYPASS_REGISTER_DB === "true") {
      const u = getBypassUser(normalizedEmail);
      if (!u) return Response.json({ error: "Invalid credentials" }, { status: 401 });
      // accept any password in dev bypass mode
      return Response.json({ user: u, message: "Login successful (dev)" });
    }

    // ── Fetch user row (includes password_hash) ───────────────────────────────
    const rows = await sql`
      SELECT * FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (rows.length === 0)
      return Response.json({ error: "Invalid credentials" }, { status: 401 });

    const row = rows[0];

    if (!row.password_hash)
      return Response.json({ error: "Invalid credentials" }, { status: 401 });

    // ── Verify scrypt hash ──────────────────────────────────────────────────
    const valid = await verifyPassword(password, row.password_hash);
    if (!valid)
      return Response.json({ error: "Invalid credentials" }, { status: 401 });

    // ── Strip password_hash from response ─────────────────────────────────────
    const { password_hash, ...user } = row;

    return Response.json({ user, message: "Login successful" });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
