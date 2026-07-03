/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, message }
 */
import { getBypassUser } from "../bypass-store";
import { createSupabaseServerClient, normalizeEmail } from "@/app/api/utils/supabase";

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

    if (process.env.BYPASS_REGISTER_DB === "true") {
      const u = getBypassUser(normalizedEmail);
      if (!u) return Response.json({ error: "Invalid credentials" }, { status: 401 });
      return Response.json({ user: u, message: "Login successful (dev)" });
    }

    const supabase = createSupabaseServerClient();
    const { data: rows, error: lookupError } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, created_at, password_hash")
      .eq("email", normalizedEmail)
      .limit(1);

    if (lookupError) {
      throw lookupError;
    }

    const row = rows?.[0];
    if (!row?.password_hash) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const storedPassword = row.password_hash;
    const providedPassword = Buffer.from(password).toString("base64");

    if (storedPassword !== providedPassword) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { password_hash, ...user } = row;
    return Response.json({ user, message: "Login successful" });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
