import { saveBypassUser } from "../../bypass-store";
import { requireAuth } from "@/app/api/utils/auth";

export async function GET(request) {
  const auth = requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  if (process.env.BYPASS_REGISTER_DB !== "true")
    return Response.json({ error: "Not allowed" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const name = url.searchParams.get("name") || "Dev User";
    if (!email) return Response.json({ error: "email query required" }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();
    const mockUser = {
      id: `dev-${Date.now()}`,
      full_name: name,
      email: normalizedEmail,
      phone: null,
      role: "donor",
      blood_type: null,
      location: null,
      availability_status: 0,
      is_verified: 1,
      created_at: new Date().toISOString(),
    };
    saveBypassUser(normalizedEmail, mockUser);
    return Response.json({ user: mockUser });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
