/**
 * GET /api/requests
 * Query params: blood_type?, limit? (max 100, default 50)
 *
 * Returns all non-Completed blood_requests, SOS tier first.
 * Mirrors the Cloudflare Worker handler exactly.
 */
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodFilter = searchParams.get("blood_type");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      100,
    );

    let requests;

    if (bloodFilter) {
      // Filtered by blood type
      requests = await sql(
        `SELECT * FROM blood_requests
         WHERE  status != 'Completed'
           AND  blood_type_needed = $1
         ORDER BY
           CASE urgency_tier WHEN 'SOS' THEN 0 WHEN 'Urgent' THEN 1 ELSE 2 END,
           created_at DESC
         LIMIT $2`,
        [bloodFilter, limit],
      );
    } else {
      // All active requests
      requests = await sql(
        `SELECT * FROM blood_requests
         WHERE  status != 'Completed'
         ORDER BY
           CASE urgency_tier WHEN 'SOS' THEN 0 WHEN 'Urgent' THEN 1 ELSE 2 END,
           created_at DESC
         LIMIT $1`,
        [limit],
      );
    }

    return Response.json({ requests });
  } catch (err) {
    console.error("[GET /api/requests]", err);
    return Response.json(
      { error: "Failed to fetch requests" },
      { status: 500 },
    );
  }
}
