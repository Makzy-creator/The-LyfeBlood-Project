import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseAuthClient,
  createSupabaseServerClient,
  getSupabaseConfig,
} from "@/app/api/utils/supabase";
import { getBearerToken, getCanonicalRole, hasRole } from "@/app/api/utils/auth";
import { createMatchesForRequest } from "@/app/api/utils/matching";
import { notifyRequestRecipients } from "@/app/api/utils/notifications";
import { normalizeBloodTypes, serializeBloodTypes } from "@/utils/bloodTypes";

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

async function getRequestCreator(request) {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: Response.json(
        { error: "Unauthorized. Please sign in to create a blood request." },
        { status: 401 },
      ),
      user: null,
    };
  }

  const authClient = createSupabaseAuthClient();
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const authUser = authData?.user;
  if (authError || !authUser?.id) {
    return {
      error: Response.json(
        { error: "Unauthorized. Please sign in to create a blood request." },
        { status: 401 },
      ),
      user: null,
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) {
    return {
      error: Response.json(
        {
          error:
            "Your patient/family profile is missing. Please complete registration or contact support before creating a request.",
        },
        { status: 409 },
      ),
      user: null,
    };
  }

  const claims = {
    sub: authUser.id,
    email: authUser.email ?? profile.email ?? null,
    role: profile.role,
  };

  if (!hasRole(claims, ["patient", "hospital_staff", "admin"])) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user: claims };
}

export async function POST(request) {
  try {
    const auth = await getRequestCreator(request);
    if (auth.error) return auth.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const {
      hospital_name,
      blood_type_needed,
      urgency_tier,
      units_needed,
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
    const selectedBloodTypes = normalizeBloodTypes(blood_type_needed);
    const serializedBloodTypes = serializeBloodTypes(selectedBloodTypes);
    if (!serializedBloodTypes) {
      return Response.json({ error: "blood_type_needed is required" }, { status: 400 });
    }
    if (units_needed == null) {
      return Response.json({ error: "units_needed is required" }, { status: 400 });
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
    if (role === "patient" && selectedBloodTypes.length > 1) {
      return Response.json(
        { error: "Patient requests can include only one blood type" },
        { status: 400 },
      );
    }
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
      p_blood_type_needed: serializedBloodTypes,
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
    if (!bloodRequest || typeof bloodRequest !== "object") {
      throw new Error("create_blood_request returned no request");
    }
    if (String(bloodRequest.requested_by) !== String(auth.user.sub)) {
      console.error("[POST /api/requests/create] created request owner mismatch", {
        expected: auth.user.sub,
        actual: bloodRequest.requested_by,
      });
      return Response.json(
        { error: "Created request ownership could not be verified" },
        { status: 500 },
      );
    }

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
