/**
 * GET /api/requests
 * Query params: blood_type?, limit? (max 100, default 50)
 *
 * Returns all non-Completed blood_requests, SOS tier first.
 */
import { createSupabaseServerClient } from "@/app/api/utils/supabase";

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
      .neq("status", "Completed")
      .order("created_at", { ascending: false });

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
