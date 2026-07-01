/**
 * POST /api/auth/register
 * Body: { full_name, email, phone, password, role, blood_type?, location? }
 *
 * Uses Node.js built-in `crypto` (scrypt) — no native binary dependencies,
 * no argon2 import, works reliably in serverless Next.js on any platform.
 */
import sql from "@/app/api/utils/sql";
import { randomBytes } from "crypto";
import { Worker } from "worker_threads";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { saveBypassUser } from "../bypass-store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runScryptInWorker(password, salt, keylen = 64, options) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`${__dirname}/hash-worker.js`, { type: 'module' });
    worker.once("message", (msg) => {
      if (msg.error) reject(new Error(msg.error));
      else resolve(msg.derived);
      worker.terminate();
    });
    worker.once("error", (err) => {
      reject(err);
      worker.terminate();
    });
    worker.postMessage({ password, salt, keylen, options });
  });
}
/** Produce a  salt$hash  string using scrypt-N=16384 (fast, safe, pure-JS path). */
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedHex = await runScryptInWorker(password, salt, 64);
  return `${salt}$${derivedHex}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, password, role, blood_type, location } =
      body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!full_name?.trim())
      return Response.json({ error: "full_name is required" }, { status: 400 });
    if (!email?.trim())
      return Response.json({ error: "email is required" }, { status: 400 });
    if (!password || password.length < 8)
      return Response.json(
        { error: "password must be at least 8 characters" },
        { status: 400 },
      );
    if (!["donor", "requester", "hospital"].includes(role))
      return Response.json(
        { error: "role must be donor, requester, or hospital" },
        { status: 400 },
      );

    const normalizedEmail = email.trim().toLowerCase();

    // Dev bypass: skip DB entirely when BYPASS_REGISTER_DB=true
    if (process.env.BYPASS_REGISTER_DB === "true") {
      const mockUser = {
        id: `dev-${Date.now()}`,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() ?? null,
        role,
        blood_type: blood_type ?? null,
        location: location ?? null,
        availability_status: 0,
        is_verified: 1,
        created_at: new Date().toISOString(),
      };
      // store in-memory for subsequent login attempts
      saveBypassUser(normalizedEmail, mockUser);
      return Response.json({ user: mockUser, message: "Registration (dev) successful" }, { status: 201 });
    }

    // ── Duplicate email guard ─────────────────────────────────────────────────
    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;
    if (existing.length > 0)
      return Response.json(
        { error: "Email already registered" },
        { status: 409 },
      );

    // ── Hash & insert ─────────────────────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    const [user] = await sql`
      INSERT INTO users
        (full_name, email, phone, role, blood_type, location,
         password_hash, availability_status, is_verified)
      VALUES (
        ${full_name.trim()},
        ${normalizedEmail},
        ${phone?.trim() ?? null},
        ${role},
        ${blood_type ?? null},
        ${location ?? null},
        ${passwordHash},
        0,
        0
      )
      RETURNING id, full_name, email, phone, role, blood_type,
                location, availability_status, is_verified, created_at
    `;

    return Response.json(
      { user, message: "Registration successful" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
