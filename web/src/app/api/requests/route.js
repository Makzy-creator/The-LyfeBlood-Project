/**
 * GET /api/requests
 * Query params: blood_type?, limit? (max 100, default 50)
 *
 * Returns all active blood_requests, SOS tier first.
 */
import { createSupabaseServerClient } from "@/app/api/utils/supabase";
import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createNotifications, requestRecipientIds } from "@/app/api/utils/notifications";

const VALID_STATUSES = [
  "pending",
  "verified",
  "donor_matched",
  "checked_in",
  "fulfilled",
  "cancelled",
];

const STATUS_ALIASES = {
  Pending: "pending",
  Verified: "verified",
  "Donor Matched": "donor_matched",
  Arrived: "checked_in",
  "Arrived At Lab": "checked_in",
  Completed: "fulfilled",
  Cancelled: "cancelled",
};

function normalizeStatusInput(status) {
  return STATUS_ALIASES[status] ?? status;
}

function sortPriority(urgencyTier) {
  switch (urgencyTier) {
    case "SOS":
      return 0;
    case "Urgent":
      return 1;
    default:
      return 2;
  }
}

export async function GET(request) {
  try {
    const auth = requireAuth(request, ["patient", "donor", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const bloodFilter = searchParams.get("blood_type");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      100,
    );

    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("blood_requests")
      .select("*")
      .not("status", "in", "(fulfilled,cancelled)")
      .order("created_at", { ascending: false });

    const role = getCanonicalRole(auth.user.role);
    if (role === "donor") {
      return Response.json({ requests: [] });
    }
    if (role === "patient") {
      query = query.eq("requested_by", auth.user.sub);
    }
    if (role === "hospital_staff") {
      query = query.or(`requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`);
    }

    if (bloodFilter) {
      query = query.eq("blood_type_needed", bloodFilter);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      throw error;
    }

    const requests = (data ?? []).sort((a, b) => {
      const aPriority = sortPriority(a?.urgency_tier);
      const bPriority = sortPriority(b?.urgency_tier);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime();
    });

    return Response.json({ requests });
  } catch (err) {
    console.error("[GET /api/requests]", err);
    return Response.json(
      { error: "Failed to fetch requests" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const auth = requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { request_id } = body;
    const requestedStatus = normalizeStatusInput(body.status);

    if (!request_id) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(requestedStatus)) {
      return Response.json(
        { error: "status must be pending, verified, donor_matched, checked_in, fulfilled, or cancelled" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const role = getCanonicalRole(auth.user.role);
    let lookup = supabase
      .from("blood_requests")
      .select("id, hospital_name, blood_type_needed, status, requested_by, hospital_id")
      .eq("id", request_id);

    if (role !== "admin") {
      lookup = lookup.or(`requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`);
    }

    const { data: currentRequest, error: lookupError } = await lookup.maybeSingle();
    if (lookupError) throw lookupError;
    if (!currentRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("blood_requests")
      .update({ status: requestedStatus })
      .eq("id", request_id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("id, donor_id")
      .eq("request_id", request_id)
      .neq("match_status", "Declined");

    if (matchesError) throw matchesError;

    const recipientIds = [
      ...requestRecipientIds(updatedRequest),
      ...((matches ?? []).map((match) => match.donor_id)),
    ];
    await createNotifications(
      supabase,
      [...new Set(recipientIds.filter(Boolean))].map((userId) => ({
        user_id: userId,
        type: "hospital_status_update",
        title: "Request status updated",
        message: `${updatedRequest.blood_type_needed} request at ${updatedRequest.hospital_name} is now ${requestedStatus.replaceAll("_", " ")}.`,
        request_id,
      })),
    );

    return Response.json({
      request: updatedRequest,
      message: "Request status updated",
    });
  } catch (err) {
    console.error("[PATCH /api/requests]", err);
    return Response.json(
      { error: "Failed to update request status" },
      { status: 500 },
    );
  }
}
