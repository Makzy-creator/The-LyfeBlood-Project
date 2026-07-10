import { createSupabaseServerClient } from "@/app/api/utils/supabase";
import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createMatchesForRequest } from "@/app/api/utils/matching";
import { notifyRequestRecipients } from "@/app/api/utils/notifications";

const VALID_TIERS = ["Standard", "Urgent", "SOS"];
const VALID_REQUEST_TYPES = ["Scheduled", "Emergency"];

function notificationDeliveryFor(requestType, scheduledFor) {
  if (requestType !== "Scheduled" || !scheduledFor) return new Date().toISOString();
  const deliverAt = new Date(scheduledFor).getTime() - 2 * 86_400_000;
  return new Date(Math.max(Date.now(), deliverAt)).toISOString();
}

function shouldRetryLegacyInsert(error) {
  const message = `${error?.message ?? ""} ${error?.details ?? ""}`.toLowerCase();
  return (
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("constraint") ||
    message.includes("violates check")
  );
}

async function insertBloodRequest(supabase, payload) {
  const { data, error } = await supabase
    .from("blood_requests")
    .insert(payload)
    .select("*")
    .single();

  if (!error) return data;
  if (!shouldRetryLegacyInsert(error)) throw error;

  const {
    latitude,
    longitude,
    hospital_id,
    status,
    units_fulfilled,
    request_type,
    scheduled_for,
    matching_status,
    ...legacyPayload
  } = payload;

  const { data: legacyData, error: legacyError } = await supabase
    .from("blood_requests")
    .insert(legacyPayload)
    .select("*")
    .single();

  if (legacyError) throw legacyError;
  return legacyData;
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

    const assignedHospitalId =
      role === "hospital_staff" ? auth.user.sub : role === "admin" ? (hospital_id ?? null) : null;
    const scheduledForValue =
      request_type === "Scheduled" ? scheduledForDate.toISOString() : null;

    const supabase = createSupabaseServerClient();
    const bloodRequest = await insertBloodRequest(supabase, {
      hospital_name: hospital_name.trim(),
      patient_ref: patient_ref ?? null,
      blood_type_needed,
      urgency_tier,
      location: location ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      requested_by: auth.user.sub,
      hospital_id: assignedHospitalId,
      units_needed: unitCount,
      urgency_note: urgency_note ?? null,
      units_fulfilled: 0,
      status: "pending",
      request_type,
      scheduled_for: scheduledForValue,
      matching_status: "pending",
    });

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
      matching = await createMatchesForRequest(supabase, bloodRequest, {
        limit: role === "patient" ? 4 : undefined,
        status: "Candidate",
        notify: false,
      });
      if (matching.inserted > 0) {
        await supabase
          .from("blood_requests")
          .update({ matching_status: "matched" })
          .eq("id", bloodRequest.id);
      }
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
