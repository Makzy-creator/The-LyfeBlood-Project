import { getCanonicalRole } from "@/app/api/utils/auth";

export async function loadAcceptedPatientDonorMatch(supabase, matchId, auth) {
  if (!matchId) {
    return {
      error: Response.json({ error: "match_id is required" }, { status: 400 }),
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) {
    return {
      error: Response.json({ error: "Match not found" }, { status: 404 }),
    };
  }
  if (match.match_status !== "Accepted") {
    return {
      error: Response.json({ error: "Chat and tracking unlock after donor acceptance" }, { status: 403 }),
    };
  }

  const { data: bloodRequest, error: requestError } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("id", match.request_id)
    .maybeSingle();

  if (requestError) throw requestError;
  if (!bloodRequest) {
    return {
      error: Response.json({ error: "Request not found" }, { status: 404 }),
    };
  }

  const role = getCanonicalRole(auth.user.role);
  const isAcceptedDonor = role === "donor" && match.donor_id === auth.user.sub;
  const isMatchedPatient = role === "patient" && bloodRequest.requested_by === auth.user.sub;

  if (!isAcceptedDonor && !isMatchedPatient) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    error: null,
    match,
    bloodRequest,
    participantRole: isAcceptedDonor ? "donor" : "patient",
  };
}
