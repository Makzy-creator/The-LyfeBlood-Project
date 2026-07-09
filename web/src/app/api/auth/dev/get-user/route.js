import { getBypassUser } from "../../bypass-store";
import { requireAuth } from "@/app/api/utils/auth";

export async function GET(request) {
  const auth = requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  if (process.env.NODE_ENV === "production" || process.env.BYPASS_REGISTER_DB !== "true")
    return Response.json({ error: "Not allowed" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email) return Response.json({ error: "email query required" }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();
    const user = getBypassUser(normalizedEmail);
    if (!user) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ user });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
