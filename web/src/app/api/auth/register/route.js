/**
 * POST /api/auth/register
 * Body: { full_name, email, phone, password, role, blood_type?, location? }
 */
import {
  createSupabaseAdminClient,
  createSupabaseAuthClient,
  createSupabaseServerClient,
  normalizeEmail,
} from "@/app/api/utils/supabase";

const SAFE_USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, created_at";

function normalizeRole(role) {
  return ["donor", "requester", "hospital"].includes(role) ? role : null;
}

function buildUserPayload({ userId, fullName, email, phone, role, bloodType, location }) {
  return {
    id: userId,
    full_name: fullName.trim(),
    email,
    phone: phone?.trim() ?? null,
    role,
    blood_type: bloodType ?? null,
    location: location ?? null,
    availability_status: 0,
    is_verified: 0,
  };
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
    const metadata = {
      full_name: full_name.trim(),
      phone: phone?.trim() ?? null,
      role: normalizedRole,
      blood_type: blood_type ?? null,
      location: location ?? null,
      availability_status: 0,
      is_verified: 0,
    };

    const admin = createSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (createError) {
      const status = createError.message?.toLowerCase().includes("already")
        ? 409
        : 400;
      return Response.json({ error: createError.message }, { status });
    }

    const authUser = created.user;
    const supabase = createSupabaseServerClient();
    const payload = buildUserPayload({
      userId: authUser.id,
      fullName: full_name,
      email: normalizedEmail,
      phone,
      role: normalizedRole,
      bloodType: blood_type,
      location,
    });

    const { data: user, error: profileError } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "id" })
      .select(SAFE_USER_SELECT)
      .single();

    if (profileError) {
      throw profileError;
    }

    const authClient = createSupabaseAuthClient();
    const { data: sessionData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (signInError) {
      throw signInError;
    }

    return Response.json(
      {
        user,
        session: sessionData.session,
        token: sessionData.session?.access_token ?? null,
        message: "Registration successful",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
