import {
  createNotifications,
  requestRecipientIds,
} from "@/app/api/utils/notifications";

export async function createMatchesForRequest(supabase, bloodRequest, options = {}) {
  if (!bloodRequest?.id) {
    return { inserted: 0, skipped: true };
  }

  const { data, error } = await supabase.rpc("create_matches_for_request", {
    p_request_id: String(bloodRequest.id),
    p_limit: options.limit ?? null,
    p_status: options.status ?? "Candidate",
  });

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  const inserted = Number(result?.inserted ?? 0);
  const skipped = Boolean(result?.skipped);
  if (options.notify !== false) {
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("id, donor_id, request_id")
      .eq("request_id", bloodRequest.id)
      .eq("match_status", options.status ?? "Candidate");

    if (matchesError) throw matchesError;

    const insertedMatches = matches ?? [];
    await createNotifications(supabase, [
      ...insertedMatches.map((match) => ({
        user_id: match.donor_id,
        type: "donor_matched",
        title: "New donor match",
        message: `${bloodRequest.blood_type_needed} needed at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id: match.id,
        deliver_at: options.deliver_at,
      })),
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "donor_matched",
        title: "Donors matched",
        message: `${insertedMatches.length} donor match${insertedMatches.length === 1 ? "" : "es"} created for ${bloodRequest.blood_type_needed}.`,
        request_id: bloodRequest.id,
        deliver_at: options.deliver_at,
      })),
    ]);
  }

  return { inserted, skipped };
}
