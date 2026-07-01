/**
 * POST /api/requests/create
 * Body: {
 *   hospital_name, blood_type_needed, urgency_tier,
 *   units_needed?, patient_ref?, location?, urgency_note?, requested_by?
 * }
 *
 * SOS-tier requests return first in GET /api/requests due to ORDER BY priority.
 */
import sql from "@/app/api/utils/sql";

const VALID_TIERS = ["Standard", "Urgent", "SOS"];

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      hospital_name,
      blood_type_needed,
      urgency_tier,
      units_needed = 1,
      patient_ref,
      location,
      urgency_note,
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
    const [bloodRequest] = await sql`
      INSERT INTO blood_requests
        (hospital_name, patient_ref, blood_type_needed, urgency_tier,
         location, requested_by, units_needed, urgency_note, units_fulfilled, status)
      VALUES (
        ${hospital_name.trim()},
        ${patient_ref ?? null},
        ${blood_type_needed},
        ${urgency_tier},
        ${location ?? null},
        ${requested_by ?? null},
        ${units_needed},
        ${urgency_note ?? null},
        0,
        'Pending'
      )
      RETURNING *
    `;

    return Response.json(
      { request: bloodRequest, message: "Request created" },
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
