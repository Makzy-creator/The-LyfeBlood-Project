import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { createSupabaseServerClient } from "@/app/api/utils/supabase";

function byId(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const role = getCanonicalRole(auth.user.role);

    const supabase = createSupabaseServerClient();
    const url = new URL(request.url);
    const matchId = url.searchParams.get("id");
    const requestId = url.searchParams.get("request_id");

    let matchesQuery = supabase
      .from("matches")
      .select("*")
      .order("match_rank", { ascending: true });

    if (matchId) matchesQuery = matchesQuery.eq("id", matchId);
    if (requestId) matchesQuery = matchesQuery.eq("request_id", requestId);

    if (role === "donor") {
      matchesQuery = matchesQuery
        .eq("donor_id", auth.user.sub)
        .in("match_status", ["Alerted", "Accepted"]);
    } else if (role !== "admin") {
      let requestQuery = supabase.from("blood_requests").select("id");
      if (role === "hospital_staff") {
        requestQuery = requestQuery.or(
          `requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`,
        );
      } else {
        requestQuery = requestQuery.eq("requested_by", auth.user.sub);
      }
      if (requestId) requestQuery = requestQuery.eq("id", requestId);

      const { data: ownedRequests, error: ownedError } = await requestQuery;
      if (ownedError) throw ownedError;

      const ownedRequestIds = (ownedRequests ?? []).map((row) => row.id);
      if (!ownedRequestIds.length) {
        return Response.json({ matches: [] });
      }
      matchesQuery = matchesQuery.in("request_id", ownedRequestIds);
    }

    const { data: matches, error } = await matchesQuery;
    if (error) throw error;

    const requestIds = [...new Set((matches ?? []).map((m) => m.request_id))];
    const donorIds = [...new Set((matches ?? []).map((m) => m.donor_id))];

    const [{ data: requests, error: requestsError }, { data: donors, error: donorsError }] =
      await Promise.all([
        requestIds.length
          ? supabase.from("blood_requests").select("*").in("id", requestIds)
          : { data: [], error: null },
        donorIds.length
          ? supabase
              .from("users")
              .select("id, full_name, blood_type, location, phone")
              .in("id", donorIds)
          : { data: [], error: null },
      ]);

    if (requestsError) throw requestsError;
    if (donorsError) throw donorsError;

    const requestsById = byId(requests);
    const donorsById = byId(donors);

    return Response.json({
      matches: (matches ?? []).map((match) => ({
        ...match,
        request: requestsById.get(match.request_id) ?? null,
        donor: donorsById.get(match.donor_id) ?? null,
      })),
    });
  } catch (err) {
    console.error("[GET /api/matches]", err);
    return Response.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
