/**
 * POST /api/auth/login
 * Body: { email, password, rememberMe }
 * Returns: { user, token, expires_at, message }
 *
 * The refresh token is never sent to the browser in the body. When
 * rememberMe is set it is stored in an httpOnly cookie; otherwise any
 * existing remembered session cookie is cleared.
 */
import {
  buildClearRememberSessionCookie,
  buildRememberSessionCookie,
} from "@/app/api/auth/session-cookie";
import {
  createSupabaseAuthClient,
  createSupabaseServerClient,
  normalizeEmail,
} from "@/app/api/utils/supabase";

const USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email?.trim() || !password)
      return Response.json(
        { error: "email and password are required" },
        { status: 400 },
      );

    const normalizedEmail = normalizeEmail(email);
    const authClient = createSupabaseAuthClient();
    const { data: authData, error: authError } =
      await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (authError || !authData.user || !authData.session) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const supabase = createSupabaseServerClient();
    const { data: user, error: profileError } = await supabase
      .from("users")
      .select(USER_SELECT)
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!user) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const rememberCookie = rememberMe
      ? buildRememberSessionCookie(request, authData.session.refresh_token)
      : buildClearRememberSessionCookie(request);

    return Response.json(
      {
        user,
        token: authData.session.access_token,
        expires_at: authData.session.expires_at ?? null,
        message: "Login successful",
      },
      {
        headers: {
          "Set-Cookie": rememberCookie,
        },
      },
    );
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
