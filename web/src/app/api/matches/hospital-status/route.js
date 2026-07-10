import { createClient } from "@supabase/supabase-js";
import { getBearerToken, requireAuth } from "@/app/api/utils/auth";
import { createNotifications, requestRecipientIds } from "@/app/api/utils/notifications";
import {
  createSupabaseServerClient,
  getSupabaseConfig,
} from "@/app/api/utils/supabase";

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

function createUserSupabaseClient(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

function rpcErrorResponse(error) {
  const message = error?.message ?? "Failed to update hospital match status";
  if (message.includes("not found")) {
    return Response.json({ error: message }, { status: 404 });
  }
  if (message.includes("Forbidden")) {
    return Response.json({ error: message }, { status: 403 });
  }
  if (
    message.includes("Only accepted") ||
    message.includes("before") ||
    message.includes("already")
  ) {
    return Response.json({ error: message }, { status: 409 });
  }
  return Response.json({ error: "Failed to update hospital match status" }, { status: 500 });
}

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
    const userSupabase = createUserSupabaseClient(request);
    const { data: result, error } = await userSupabase.rpc("mark_hospital_status", {
      p_match_id: matchId,
      p_action: body.action,
    });

    if (error) throw error;

    const updatedMatch = result?.match;
    const updatedRequest = result?.request;
    const nextRequestStatus = result?.new_status;
    const bloodRequest = updatedRequest;
    const match = updatedMatch;

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
    return rpcErrorResponse(err);
  }
}
