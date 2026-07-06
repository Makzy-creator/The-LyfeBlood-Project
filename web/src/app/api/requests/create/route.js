/**
 * POST /api/requests/create
 * Body: {
 *   hospital_name, blood_type_needed, urgency_tier,
 *   units_needed?, patient_ref?, location?, urgency_note?, requested_by?
 * }
 *
 * SOS-tier requests return first in GET /api/requests due to ORDER BY priority.
 */
import { createSupabaseServerClient } from "@/app/api/utils/supabase";
import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createMatchesForRequest } from "@/app/api/utils/matching";
import { notifyRequestRecipients } from "@/app/api/utils/notifications";

const VALID_TIERS = ["Standard", "Urgent", "SOS"];

export async function POST(request) {
  try {
    const auth = requireAuth(request, ["patient", "hospital_staff", "admin"]);
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
      requested_by,
    } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!hospital_name?.trim())
      return Response.json(
        { error: "hospital_name is required" },
        { status: 400 },
      );
    if (!blood_type_needed)
      return Response.json(
        { error: "blood_type_needed is required" },
        { status: 400 },
      );
    if (!VALID_TIERS.includes(urgency_tier))
      return Response.json(
        { error: "urgency_tier must be Standard, Urgent, or SOS" },
        { status: 400 },
      );

    // ── Insert ────────────────────────────────────────────────────────────────
    const role = getCanonicalRole(auth.user.role);
    const assignedHospitalId =
      role === "hospital_staff" ? auth.user.sub : role === "admin" ? (hospital_id ?? null) : null;

    const supabase = createSupabaseServerClient();
    const { data: bloodRequest, error } = await supabase
      .from("blood_requests")
      .insert({
        hospital_name: hospital_name.trim(),
        patient_ref: patient_ref ?? null,
        blood_type_needed,
        urgency_tier,
        location: location ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        requested_by: auth.user.sub,
        hospital_id: assignedHospitalId,
        units_needed,
        urgency_note: urgency_note ?? null,
        units_fulfilled: 0,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await notifyRequestRecipients(supabase, bloodRequest, {
      type: "request_created",
      title: "Blood request created",
      message: `${bloodRequest.blood_type_needed} request created at ${bloodRequest.hospital_name}.`,
      request_id: bloodRequest.id,
    });

    const matching = await createMatchesForRequest(supabase, bloodRequest);

    return Response.json(
      { request: bloodRequest, matching, message: "Request created" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/requests/create]", err);
    return Response.json(
      { error: "Failed to create request" },
      { status: 500 },
    );
  }
}
