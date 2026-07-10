import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseServerClient,
  getSupabaseConfig,
} from "@/app/api/utils/supabase";
import { getBearerToken, getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createMatchesForRequest } from "@/app/api/utils/matching";
import { notifyRequestRecipients } from "@/app/api/utils/notifications";

const VALID_TIERS = ["Standard", "Urgent", "SOS"];
const VALID_REQUEST_TYPES = ["Scheduled", "Emergency"];

function notificationDeliveryFor(requestType, scheduledFor) {
  if (requestType !== "Scheduled" || !scheduledFor) return new Date().toISOString();
  const deliverAt = new Date(scheduledFor).getTime() - 2 * 86_400_000;
  return new Date(Math.max(Date.now(), deliverAt)).toISOString();
}

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

export async function POST(request) {
  try {
    const auth = await requireAuth(request, ["patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const {
      hospital_name,
      blood_type_needed,
      urgency_tier,
      units_needed = 1,
      patient_ref,
      location,
      latitude,
      longitude,
      urgency_note,
      hospital_id,
      request_type = "Emergency",
      scheduled_for,
    } = body;

    if (!hospital_name?.trim()) {
      return Response.json({ error: "hospital_name is required" }, { status: 400 });
    }
    if (!blood_type_needed) {
      return Response.json({ error: "blood_type_needed is required" }, { status: 400 });
    }
    if (!VALID_TIERS.includes(urgency_tier)) {
      return Response.json(
        { error: "urgency_tier must be Standard, Urgent, or SOS" },
        { status: 400 },
      );
    }
    if (!VALID_REQUEST_TYPES.includes(request_type)) {
      return Response.json(
        { error: "request_type must be Scheduled or Emergency" },
        { status: 400 },
      );
    }

    const role = getCanonicalRole(auth.user.role);
    const unitCount = Number(units_needed);
    if (!Number.isInteger(unitCount) || unitCount < 1) {
      return Response.json(
        { error: "units_needed must be a positive integer" },
        { status: 400 },
      );
    }
    if (role === "patient" && unitCount > 5) {
      return Response.json(
        { error: "Patient requests cannot exceed 5 pints" },
        { status: 400 },
      );
    }

    const scheduledForDate = scheduled_for ? new Date(scheduled_for) : null;
    if (request_type === "Scheduled") {
      if (!scheduledForDate || !Number.isFinite(scheduledForDate.getTime())) {
        return Response.json(
          { error: "scheduled_for is required for Scheduled requests" },
          { status: 400 },
        );
      }
      if (scheduledForDate.getTime() <= Date.now()) {
        return Response.json(
          { error: "scheduled_for must be in the future" },
          { status: 400 },
        );
      }
    }

    const scheduledForValue =
      request_type === "Scheduled" ? scheduledForDate.toISOString() : null;

    const userSupabase = createUserSupabaseClient(request);
    const { data: bloodRequest, error: createError } = await userSupabase.rpc("create_blood_request", {
      p_hospital_name: hospital_name.trim(),
      p_blood_type_needed: blood_type_needed,
      p_urgency_tier: urgency_tier,
      p_units_needed: unitCount,
      p_patient_ref: patient_ref ?? null,
      p_location: location ?? null,
      p_latitude: latitude ?? null,
      p_longitude: longitude ?? null,
      p_urgency_note: urgency_note ?? null,
      p_hospital_id: role === "admin" ? (hospital_id ?? null) : null,
      p_request_type: request_type,
      p_scheduled_for: scheduledForValue,
    });

    if (createError) throw createError;

    const supabase = createSupabaseServerClient();
    const deliverAt = notificationDeliveryFor(request_type, scheduledForValue);
    const sideEffectWarnings = [];

    try {
      await notifyRequestRecipients(supabase, bloodRequest, {
        type: "request_created",
        title: "Blood request created",
        message: `${bloodRequest.blood_type_needed} request created at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        deliver_at: deliverAt,
      });
    } catch (error) {
      console.error("[POST /api/requests/create] notification side effect failed", error);
      sideEffectWarnings.push("request_created_notification_failed");
    }

    let matching = { inserted: 0, skipped: true };
    try {
      matching = await createMatchesForRequest(userSupabase, bloodRequest, {
        limit: role === "patient" ? 4 : undefined,
        status: "Candidate",
        notify: false,
      });
    } catch (error) {
      console.error("[POST /api/requests/create] matching side effect failed", error);
      sideEffectWarnings.push("matching_failed");
    }

    return Response.json(
      { request: bloodRequest, matching, sideEffectWarnings, message: "Request created" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/requests/create]", err);
    return Response.json({ error: "Failed to create request" }, { status: 500 });
  }
}
