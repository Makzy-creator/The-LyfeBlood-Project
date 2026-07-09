import { saveBypassUser } from "../auth/bypass-store";
import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createSupabaseServerClient, normalizeEmail } from "@/app/api/utils/supabase";

function normalizeRole(role) {
  return ["donor", "requester", "hospital"].includes(role) ? role : null;
}

const SAFE_USER_SELECT =
  "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, reward_points, created_at";

export async function GET(request) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const supabase = createSupabaseServerClient();
    const { data: user, error } = await supabase
      .from("users")
      .select(SAFE_USER_SELECT)
      .eq("id", auth.user.sub)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return Response.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const {
      id,
      full_name,
      phone,
      role,
      blood_type,
      location,
      availability_status,
      email,
    } = body;

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    const isAdmin = getCanonicalRole(auth.user.role) === "admin";
    if (!isAdmin && id !== auth.user.sub) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!full_name?.trim()) {
      return Response.json({ error: "full_name is required" }, { status: 400 });
    }

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      return Response.json(
        { error: "role must be donor, requester, or hospital" },
        { status: 400 },
      );
    }

    if (!isAdmin && getCanonicalRole(normalizedRole) !== getCanonicalRole(auth.user.role)) {
      return Response.json({ error: "Role changes require admin access" }, { status: 403 });
    }

    if (normalizedRole === "donor" && !blood_type) {
      return Response.json(
        { error: "blood_type is required for donor role" },
        { status: 400 },
      );
    }

    const payload = {
      id,
      full_name: full_name.trim(),
      phone: phone?.trim() ?? null,
      role: normalizedRole,
      blood_type: blood_type ?? null,
      location: location?.trim() ?? null,
      availability_status: availability_status ? 1 : 0,
    };

    if (process.env.NODE_ENV !== "production" && process.env.BYPASS_REGISTER_DB === "true") {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return Response.json({ error: "email is required" }, { status: 400 });
      }
      const user = {
        ...payload,
        email: normalizedEmail,
        is_verified: 1,
        reward_points: 0,
        created_at: new Date().toISOString(),
      };
      saveBypassUser(normalizedEmail, user);
      return Response.json({ user, message: "Profile updated (dev)" });
    }

    const supabase = createSupabaseServerClient();
    const { data: user, error } = await supabase
      .from("users")
      .update({
        full_name: payload.full_name,
        phone: payload.phone,
        role: payload.role,
        blood_type: payload.blood_type,
        location: payload.location,
        availability_status: payload.availability_status,
      })
      .eq("id", id)
      .select(SAFE_USER_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ user, message: "Profile updated" });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
