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
  "blood_collected",
  "fulfilled",
  "cancelled",
];

const STATUS_ALIASES = {
  Pending: "pending",
  Verified: "verified",
  "Donor Matched": "donor_matched",
  Arrived: "checked_in",
  "Arrived At Lab": "checked_in",
  "Blood Collected": "blood_collected",
  Completed: "fulfilled",
  Cancelled: "cancelled",
};

const REQUEST_TYPES_BY_DONOR = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
  AB: ["AB-", "AB+"],
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
    const auth = await requireAuth(request, ["patient", "donor", "hospital_staff", "admin"]);
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
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    const role = getCanonicalRole(auth.user.role);
    if (role === "donor") {
      const { data: donor, error: donorError } = await supabase
        .from("users")
        .select("blood_type")
        .eq("id", auth.user.sub)
        .maybeSingle();

      if (donorError) throw donorError;

      const compatibleRequestTypes = REQUEST_TYPES_BY_DONOR[donor?.blood_type] ?? [];
      if (!compatibleRequestTypes.length) {
        return Response.json({ requests: [] });
      }

      query = query
        .neq("status", "fulfilled")
        .in("blood_type_needed", compatibleRequestTypes);
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
    const auth = await requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { request_id } = body;
    const requestedStatus = normalizeStatusInput(body.status);

    if (!request_id) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(requestedStatus)) {
      return Response.json(
        { error: "status must be pending, verified, donor_matched, checked_in, blood_collected, fulfilled, or cancelled" },
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

    if (requestedStatus === "fulfilled") {
      const { data: collectedMatches, error: collectedMatchesError } = await supabase
        .from("matches")
        .select("id, donor_id, donation_completed_at")
        .eq("request_id", request_id)
        .eq("match_status", "Accepted")
        .not("blood_collected_at", "is", null);

      if (collectedMatchesError) throw collectedMatchesError;
      if (!collectedMatches?.length) {
        return Response.json(
          { error: "Blood collection must be recorded before completing donation" },
          { status: 409 },
        );
      }

      const completedAt = new Date().toISOString();
      const newlyCompletedMatches = collectedMatches.filter(
        (match) => !match.donation_completed_at,
      );

      if (newlyCompletedMatches.length) {
        const { error: completeMatchesError } = await supabase
          .from("matches")
          .update({ donation_completed_at: completedAt })
          .in("id", newlyCompletedMatches.map((match) => match.id));

        if (completeMatchesError) throw completeMatchesError;
      }

      const donorIds = [...new Set(newlyCompletedMatches.map((match) => match.donor_id).filter(Boolean))];
      if (donorIds.length) {
        const { error: donorCooldownError } = await supabase
          .from("users")
          .update({
            last_donation_at: completedAt,
            availability_status: 0,
          })
          .in("id", donorIds);

        if (donorCooldownError) throw donorCooldownError;
      }
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("blood_requests")
      .update({
        status: requestedStatus,
        ...(requestedStatus === "fulfilled" ? { matching_status: "completed" } : {}),
      })
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
