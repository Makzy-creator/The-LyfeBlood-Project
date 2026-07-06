import {
  createNotifications,
  requestRecipientIds,
} from "@/app/api/utils/notifications";

const DONATION_COOLDOWN_DAYS = 56;

const COMPATIBLE_DONORS = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function daysSince(value) {
  if (!value) return Infinity;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return Infinity;
  return (Date.now() - time) / 86_400_000;
}

function distanceKm(aLat, aLng, bLat, bLng) {
  const earthKm = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

function matchLimitForUrgency(urgency) {
  if (urgency === "SOS") return 50;
  if (urgency === "Urgent") return 25;
  return 10;
}

export async function createMatchesForRequest(supabase, bloodRequest) {
  const requestLat = toNumber(bloodRequest?.latitude);
  const requestLng = toNumber(bloodRequest?.longitude);
  const compatibleTypes = COMPATIBLE_DONORS[bloodRequest?.blood_type_needed] ?? [];

  if (!bloodRequest?.id || !compatibleTypes.length || requestLat === null || requestLng === null) {
    return { inserted: 0, skipped: true };
  }

  const { data: donors, error } = await supabase
    .from("users")
    .select(
      "id, blood_type, latitude, longitude, last_donation_at, availability_status, is_verified, is_suspended, is_inactive, matching_opt_out",
    )
    .eq("role", "donor")
    .eq("availability_status", 1)
    .eq("is_verified", 1)
    .eq("is_suspended", false)
    .eq("is_inactive", false)
    .eq("matching_opt_out", false)
    .in("blood_type", compatibleTypes)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) throw error;

  const rankedDonors = (donors ?? [])
    .filter((donor) => daysSince(donor.last_donation_at) >= DONATION_COOLDOWN_DAYS)
    .map((donor) => ({
      donor_id: donor.id,
      distance_km: Number(
        distanceKm(requestLat, requestLng, Number(donor.latitude), Number(donor.longitude)).toFixed(2),
      ),
    }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, matchLimitForUrgency(bloodRequest.urgency_tier))
    .map((donor, index) => ({
      request_id: bloodRequest.id,
      donor_id: donor.donor_id,
      match_status: "Alerted",
      distance_km: donor.distance_km,
      match_rank: index + 1,
      notified_at: new Date().toISOString(),
    }));

  if (!rankedDonors.length) {
    return { inserted: 0, skipped: false };
  }

  const { data: matches, error: insertError } = await supabase
    .from("matches")
    .upsert(rankedDonors, {
      onConflict: "request_id,donor_id",
      ignoreDuplicates: true,
    })
    .select("id, donor_id, request_id");

  if (insertError) throw insertError;

  const insertedMatches = matches ?? [];
  await createNotifications(supabase, [
    ...insertedMatches.map((match) => ({
      user_id: match.donor_id,
      type: "donor_matched",
      title: "New donor match",
      message: `${bloodRequest.blood_type_needed} needed at ${bloodRequest.hospital_name}.`,
      request_id: bloodRequest.id,
      match_id: match.id,
    })),
    ...requestRecipientIds(bloodRequest).map((userId) => ({
      user_id: userId,
      type: "donor_matched",
      title: "Donors matched",
      message: `${insertedMatches.length} donor match${insertedMatches.length === 1 ? "" : "es"} created for ${bloodRequest.blood_type_needed}.`,
      request_id: bloodRequest.id,
    })),
  ]);

  return { inserted: matches?.length ?? 0, skipped: false };
}
