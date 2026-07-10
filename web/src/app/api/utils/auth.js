import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import {
  createSupabaseAuthClient,
  createSupabaseServerClient,
} from "@/app/api/utils/supabase";

const HASH_ITERATIONS = 210000;
const HASH_KEY_LENGTH = 32;
const HASH_DIGEST = "sha256";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const ROLE_ALIASES = {
  requester: "patient",
  patient_family: "patient",
  patient: "patient",
  hospital: "hospital_staff",
  hospital_officer: "hospital_staff",
  hospital_staff: "hospital_staff",
  donor: "donor",
  admin: "admin",
};

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(
    padded.replaceAll("-", "+").replaceAll("_", "/"),
    "base64",
  ).toString("utf8");
}

function getAuthSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.OTP_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("AUTH_SECRET is required for auth token signing");
  }
  return secret;
}

function sign(input) {
  return base64UrlEncode(
    createHmac("sha256", getAuthSecret()).update(input).digest(),
  );
}

function verifySignedJwt(token, secret) {
  try {
    const parts = token?.split(".");
    if (parts?.length !== 3 || !secret) return null;

    const [header, payload, signature] = parts;
    const unsigned = `${header}.${payload}`;
    const expected = base64UrlEncode(
      createHmac("sha256", secret).update(unsigned).digest(),
    );

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const claims = JSON.parse(base64UrlDecode(payload));
    if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_DIGEST,
  ).toString("hex");

  return `pbkdf2$${HASH_ITERATIONS}$${salt}$${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash?.startsWith("pbkdf2$")) return false;

  const [, iterations, salt, expected] = storedHash.split("$");
  if (!iterations || !salt || !expected) return false;

  const actual = pbkdf2Sync(
    password,
    salt,
    Number(iterations),
    HASH_KEY_LENGTH,
    HASH_DIGEST,
  );
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    actual.length === expectedBuffer.length &&
    timingSafeEqual(actual, expectedBuffer)
  );
}

export function verifyLegacyBase64Password(password, storedPassword) {
  return storedPassword === Buffer.from(password).toString("base64");
}

export function createSessionToken(user) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }),
  );
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifySessionToken(token) {
  try {
    const legacyClaims = verifySignedJwt(token, getAuthSecret());
    if (legacyClaims) return legacyClaims;
  } catch {
    return null;
  }

  return null;
}

export function getBearerToken(request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export function getCanonicalRole(role) {
  return ROLE_ALIASES[role] ?? role;
}

export function hasRole(user, allowedRoles) {
  const userRole = getCanonicalRole(user?.role);
  if (userRole === "admin") return true;
  return (allowedRoles ?? []).map(getCanonicalRole).includes(userRole);
}

export async function requireAuth(request, allowedRoles) {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  const authClient = createSupabaseAuthClient();
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const authUser = authData?.user;
  if (authError || !authUser) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  const claims = {
    sub: authUser.id,
    email: authUser.email ?? profile.email ?? null,
    role: profile.role,
  };

  if (allowedRoles?.length && !hasRole(claims, allowedRoles)) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user: claims };
}
