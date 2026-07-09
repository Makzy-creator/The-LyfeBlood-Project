/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, message }
 */
import { getBypassUser } from "../bypass-store";
import { verify as verifyArgon2 } from "argon2";
import {
  createSessionToken,
  hashPassword,
  verifyLegacyBase64Password,
  verifyPassword,
} from "@/app/api/utils/auth";
import { createSupabaseServerClient, normalizeEmail } from "@/app/api/utils/supabase";

const USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, reward_points, created_at, password_hash";

async function verifyArgon2Password(password, storedPassword) {
  if (!storedPassword?.startsWith("$argon2")) return false;
  try {
    return await verifyArgon2(storedPassword, password);
  } catch {
    return false;
  }
}

async function getCreateAuthUser(supabase, normalizedEmail, password, existingUser = null) {
  try {
    const { data: authUsers, error: userError } = await supabase
      .from("auth_users")
      .select("id, name, email")
      .ilike("email", normalizedEmail)
      .limit(1);

    if (userError) return null;

    const authUser = authUsers?.[0];
    if (!authUser) return null;

    const { data: accounts, error: accountError } = await supabase
      .from("auth_accounts")
      .select("password, provider")
      .eq("userId", authUser.id)
      .eq("provider", "credentials")
      .limit(1);

    if (accountError) return null;

    const account = accounts?.[0];
    const isValid = await verifyArgon2Password(password, account?.password);
    if (!isValid) return null;

    return {
      id: existingUser?.id ?? authUser.id,
      full_name: existingUser?.full_name ?? authUser.name ?? authUser.email,
      email: existingUser?.email ?? authUser.email,
      phone: existingUser?.phone ?? null,
      role: existingUser?.role ?? "donor",
      blood_type: existingUser?.blood_type ?? null,
      location: existingUser?.location ?? null,
      availability_status: existingUser?.availability_status ?? 0,
      is_verified: existingUser?.is_verified ?? 0,
      last_donation_at: existingUser?.last_donation_at ?? null,
      reward_points: existingUser?.reward_points ?? 0,
      created_at: existingUser?.created_at ?? new Date().toISOString(),
    };
  } catch {
    return null;
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

    const normalizedEmail = normalizeEmail(email);

    if (process.env.NODE_ENV !== "production" && process.env.BYPASS_REGISTER_DB === "true") {
      const u = getBypassUser(normalizedEmail);
      if (!u) return Response.json({ error: "Invalid credentials" }, { status: 401 });
      return Response.json({ user: u, message: "Login successful (dev)" });
    }

    const supabase = createSupabaseServerClient();
    const { data: rows, error: lookupError } = await supabase
      .from("users")
      .select(USER_SELECT)
      .ilike("email", normalizedEmail)
      .limit(1);

    if (lookupError) {
      throw lookupError;
    }

    const row = rows?.[0];
    if (!row?.password_hash) {
      const createAuthUser = await getCreateAuthUser(supabase, normalizedEmail, password, row);
      if (!createAuthUser) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = createSessionToken(createAuthUser);
      return Response.json({ user: createAuthUser, token, message: "Login successful" });
    }

    const storedPassword = row.password_hash;
    const isHashedPassword = verifyPassword(password, storedPassword);
    const isLegacyPassword = verifyLegacyBase64Password(password, storedPassword);
    const isArgon2Password = await verifyArgon2Password(password, storedPassword);

    if (!isHashedPassword && !isLegacyPassword && !isArgon2Password) {
      const { password_hash, ...existingUser } = row;
      const createAuthUser = await getCreateAuthUser(
        supabase,
        normalizedEmail,
        password,
        existingUser,
      );
      if (!createAuthUser) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = createSessionToken(createAuthUser);
      return Response.json({ user: createAuthUser, token, message: "Login successful" });
    }

    const { password_hash, ...user } = row;

    if (isLegacyPassword || isArgon2Password) {
      const { error: upgradeError } = await supabase
        .from("users")
        .update({ password_hash: hashPassword(password) })
        .eq("id", user.id);

      if (upgradeError) {
        throw upgradeError;
      }
    }

    const token = createSessionToken(user);
    return Response.json({ user, token, message: "Login successful" });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
