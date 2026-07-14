import { buildClearRememberSessionCookie } from "@/app/api/auth/session-cookie";

export async function POST(request) {
  return Response.json(
    { message: "Logged out" },
    {
      headers: {
        "Set-Cookie": buildClearRememberSessionCookie(request),
      },
    },
  );
}
