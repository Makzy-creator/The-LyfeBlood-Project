import { createSupabaseServerClient } from "@/app/api/utils/supabase";
import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";

function getRequestId(request, params) {
  if (params?.requestId) return params.requestId;
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");
}

async function donorHasAssignedMatch(supabase, requestId, donorId) {
  const { data, error } = await supabase
    .from("matches")
    .select("id")
    .eq("request_id", requestId)
    .eq("donor_id", donorId)
    .neq("match_status", "Declined")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function GET(request, context = {}) {
  try {
    const auth = requireAuth(request, ["patient", "donor", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;

    const params = await context.params;
    const requestId = getRequestId(request, params);
    if (!requestId) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data: bloodRequest, error } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (error) throw error;
    if (!bloodRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const role = getCanonicalRole(auth.user.role);
    let authorized =
      role === "admin" ||
      bloodRequest.requested_by === auth.user.sub ||
      bloodRequest.hospital_id === auth.user.sub;

    if (!authorized && role === "donor") {
      authorized = await donorHasAssignedMatch(supabase, requestId, auth.user.sub);
    }

    if (!authorized) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    return Response.json({ request: bloodRequest });
  } catch (err) {
    console.error("[GET /api/requests/:id]", err);
    return Response.json(
      { error: "Failed to fetch request" },
      { status: 500 },
    );
  }
}
