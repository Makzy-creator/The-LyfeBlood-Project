import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createNotifications, requestRecipientIds } from "@/app/api/utils/notifications";
import { createSupabaseServerClient } from "@/app/api/utils/supabase";

const ACTIONS = {
  arrived: {
    matchField: "arrived_at",
    requestStatus: "checked_in",
    message: "Donor marked as arrived.",
    notificationTitle: "Donor arrived",
  },
  blood_collected: {
    matchField: "blood_collected_at",
    requestStatus: "blood_collected",
    message: "Blood collection recorded.",
    notificationTitle: "Blood collected",
  },
  donation_completed: {
    matchField: "donation_completed_at",
    requestStatus: "fulfilled",
    message: "Donation completed.",
    notificationTitle: "Donation completed",
  },
};

export async function POST(request) {
  try {
    const auth = await requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const matchId = body.match_id;
    const action = ACTIONS[body.action];

    if (!matchId) {
      return Response.json({ error: "match_id is required" }, { status: 400 });
    }
    if (!action) {
      return Response.json(
        { error: "action must be arrived, blood_collected, or donation_completed" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const role = getCanonicalRole(auth.user.role);

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, request_id, donor_id, match_status, arrived_at, blood_collected_at, donation_completed_at")
      .eq("id", matchId)
      .maybeSingle();

    if (matchError) throw matchError;
    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }
    if (match.match_status !== "Accepted") {
      return Response.json({ error: "Only accepted matches can be updated" }, { status: 409 });
    }
    if (body.action === "blood_collected" && !match.arrived_at) {
      return Response.json({ error: "Mark donor as arrived before recording blood collection" }, { status: 409 });
    }
    if (body.action === "donation_completed" && !match.blood_collected_at) {
      return Response.json({ error: "Record blood collection before completing donation" }, { status: 409 });
    }
    if (body.action === "donation_completed" && match.donation_completed_at) {
      return Response.json({ error: "Donation is already completed" }, { status: 409 });
    }

    const { data: bloodRequest, error: requestError } = await supabase
      .from("blood_requests")
      .select("id, requested_by, hospital_id, hospital_name, blood_type_needed, status")
      .eq("id", match.request_id)
      .maybeSingle();

    if (requestError) throw requestError;
    if (!bloodRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    if (
      role !== "admin" &&
      bloodRequest.requested_by !== auth.user.sub &&
      bloodRequest.hospital_id !== auth.user.sub
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (["fulfilled", "cancelled"].includes(bloodRequest.status)) {
      return Response.json({ error: "Request is already closed" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const { data: updatedMatch, error: updateMatchError } = await supabase
      .from("matches")
      .update({ [action.matchField]: match[action.matchField] ?? now })
      .eq("id", matchId)
      .select("id, request_id, donor_id, match_status, arrived_at, blood_collected_at, donation_completed_at")
      .single();

    if (updateMatchError) throw updateMatchError;

    const nextRequestStatus =
      body.action === "arrived" && bloodRequest.status === "blood_collected"
        ? "blood_collected"
        : action.requestStatus;

    if (body.action === "donation_completed") {
      const { error: donorUpdateError } = await supabase
        .from("users")
        .update({
          last_donation_at: now,
          availability_status: 0,
        })
        .eq("id", match.donor_id);

      if (donorUpdateError) throw donorUpdateError;
    }

    const { data: updatedRequest, error: updateRequestError } = await supabase
      .from("blood_requests")
      .update({
        status: nextRequestStatus,
        ...(body.action === "donation_completed" ? { matching_status: "completed" } : {}),
      })
      .eq("id", match.request_id)
      .select("*")
      .single();

    if (updateRequestError) throw updateRequestError;

    const recipients = [...requestRecipientIds(bloodRequest), match.donor_id];
    await createNotifications(
      supabase,
      [...new Set(recipients.filter(Boolean))].map((userId) => ({
        user_id: userId,
        type: "hospital_status_update",
        title: action.notificationTitle,
        message: `${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name} is now ${nextRequestStatus.replaceAll("_", " ")}.`,
        request_id: match.request_id,
        match_id: match.id,
      })),
    );

    return Response.json({
      message: action.message,
      match: updatedMatch,
      request: updatedRequest,
      new_status: nextRequestStatus,
      verified_by: auth.user.sub,
    });
  } catch (err) {
    console.error("[POST /api/matches/hospital-status]", err);
    return Response.json({ error: "Failed to update hospital match status" }, { status: 500 });
  }
}
