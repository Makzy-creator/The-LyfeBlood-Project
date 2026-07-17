import {
  buildClearRememberSessionCookie,
  buildRememberSessionCookie,
  readCookie,
  REMEMBER_SESSION_COOKIE,
} from "@/app/api/auth/session-cookie";
import {
  createSupabaseAuthClient,
  createSupabaseServerClient,
} from "@/app/api/utils/supabase";

const USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at";

async function loadProfile(userId) {
  const supabase = createSupabaseServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return user;
}

export async function GET(request) {
  try {
    const refreshToken = readCookie(request, REMEMBER_SESSION_COOKIE);
    if (!refreshToken) {
      return Response.json({ error: "No remembered session" }, { status: 401 });
    }

    const authClient = createSupabaseAuthClient();
    const { data, error } = await authClient.auth.refreshSession({
      refresh_token: decodeURIComponent(refreshToken),
    });

    if (error || !data?.session?.access_token || !data?.session?.refresh_token || !data?.user?.id) {
      return Response.json(
        { error: "Remembered session expired" },
        {
          status: 401,
          headers: {
            "Set-Cookie": buildClearRememberSessionCookie(request),
          },
        },
      );
    }

    const user = await loadProfile(data.user.id);
    if (!user) {
      return Response.json(
        { error: "Profile not found" },
        {
          status: 404,
          headers: {
            "Set-Cookie": buildClearRememberSessionCookie(request),
          },
        },
      );
    }

    return Response.json(
      {
        user,
        token: data.session.access_token,
        expires_at: data.session.expires_at ?? null,
        message: "Session restored",
      },
      {
        headers: {
          "Set-Cookie": buildRememberSessionCookie(request, data.session.refresh_token),
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/auth/session]", err);
    return Response.json({ error: "Failed to restore session" }, { status: 500 });
  }
}
