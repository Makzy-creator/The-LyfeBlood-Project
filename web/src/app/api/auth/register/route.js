/**
 * POST /api/auth/register
 * Body: { full_name, email, phone, password, role, blood_type?, location? }
 */
import { saveBypassUser } from "../bypass-store";
import { createSessionToken, hashPassword } from "@/app/api/utils/auth";
import { createSupabaseServerClient, normalizeEmail } from "@/app/api/utils/supabase";

const USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, reward_points, created_at, password_hash";
const SAFE_USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, reward_points, created_at";

function normalizeRole(role) {
  return ["donor", "requester", "hospital"].includes(role) ? role : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, password, role, blood_type, location } = body;

    if (!full_name?.trim())
      return Response.json({ error: "full_name is required" }, { status: 400 });
    if (!email?.trim())
      return Response.json({ error: "email is required" }, { status: 400 });
    if (!password || password.length < 8)
      return Response.json(
        { error: "password must be at least 8 characters" },
        { status: 400 },
      );

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole)
      return Response.json(
        { error: "role must be donor, requester, or hospital" },
        { status: 400 },
      );

    const normalizedEmail = normalizeEmail(email);

    if (process.env.NODE_ENV !== "production" && process.env.BYPASS_REGISTER_DB === "true") {
      const mockUser = {
        id: `dev-${Date.now()}`,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() ?? null,
        role: normalizedRole,
        blood_type: blood_type ?? null,
        location: location ?? null,
        availability_status: 0,
        is_verified: 1,
        reward_points: 0,
        created_at: new Date().toISOString(),
      };
      saveBypassUser(normalizedEmail, mockUser);
      return Response.json(
        { user: mockUser, message: "Registration (dev) successful" },
        { status: 201 },
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: existingRows, error: lookupError } = await supabase
      .from("users")
      .select(USER_SELECT)
      .ilike("email", normalizedEmail)
      .limit(1);

    if (lookupError) {
      throw lookupError;
    }

    const passwordHash = hashPassword(password);
    const existingUser = existingRows?.[0];

    if (existingUser?.password_hash) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    if (existingUser) {
      const { data: completedUser, error: updateError } = await supabase
        .from("users")
        .update({
          full_name: full_name.trim(),
          phone: phone?.trim() ?? null,
          role: normalizedRole,
          blood_type: blood_type ?? null,
          location: location ?? null,
          password_hash: passwordHash,
          availability_status: existingUser.availability_status ?? 0,
          is_verified: existingUser.is_verified ?? 0,
        })
        .eq("id", existingUser.id)
        .select(SAFE_USER_SELECT)
        .single();

      if (updateError) {
        throw updateError;
      }

      const token = createSessionToken(completedUser);
      return Response.json(
        { user: completedUser, token, message: "Registration completed" },
        { status: 200 },
      );
    }

    const createdAt = new Date().toISOString();

    const { data: insertedRows, error: insertError } = await supabase
      .from("users")
      .insert({
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() ?? null,
        role: normalizedRole,
        blood_type: blood_type ?? null,
        location: location ?? null,
        password_hash: passwordHash,
        availability_status: 0,
        is_verified: 0,
        created_at: createdAt,
      })
      .select(SAFE_USER_SELECT)
      .single();

    if (insertError) {
      throw insertError;
    }

    const token = createSessionToken(insertedRows);

    return Response.json(
      { user: insertedRows, token, message: "Registration successful" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
