import { requireAuth } from "@/app/api/utils/auth";
import { loadAcceptedPatientDonorMatch } from "@/app/api/utils/match-access";
import { createSupabaseServerClient } from "@/app/api/utils/supabase";

const TRAVEL_STATUSES = new Set(["on_the_way", "arrived"]);
const AVERAGE_CITY_SPEED_KMH = 25;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getMatchId(request) {
  return new URL(request.url).searchParams.get("match_id");
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

function calculateTravel(latitude, longitude, bloodRequest) {
  const donorLat = toNumber(latitude);
  const donorLng = toNumber(longitude);
  const requestLat = toNumber(bloodRequest.latitude);
  const requestLng = toNumber(bloodRequest.longitude);

  if ([donorLat, donorLng, requestLat, requestLng].some((value) => value === null)) {
    return { distance_km: null, eta_minutes: null };
  }

  const distance = Number(distanceKm(donorLat, donorLng, requestLat, requestLng).toFixed(2));
  return {
    distance_km: distance,
    eta_minutes: Math.max(1, Math.ceil((distance / AVERAGE_CITY_SPEED_KMH) * 60)),
  };
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;

    const matchId = getMatchId(request);
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
    if (access.error) return access.error;

    const { data: locations, error } = await supabase
      .from("donor_locations")
      .select("id, match_id, donor_id, latitude, longitude, distance_km, eta_minutes, status, created_at")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return Response.json({
      match: access.match,
      request: access.bloodRequest,
      participant_role: access.participantRole,
      latest_location: locations?.[0] ?? null,
      locations: locations ?? [],
    });
  } catch (err) {
    console.error("[GET /api/matches/tracking]", err);
    return Response.json({ error: "Failed to load tracking" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, ["donor"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const matchId = body.match_id;
    const latitude = toNumber(body.latitude);
    const longitude = toNumber(body.longitude);
    const status = body.status ?? "on_the_way";

    if (!TRAVEL_STATUSES.has(status)) {
      return Response.json({ error: "status must be on_the_way or arrived" }, { status: 400 });
    }
    if (latitude === null || latitude < -90 || latitude > 90) {
      return Response.json({ error: "valid latitude is required" }, { status: 400 });
    }
    if (longitude === null || longitude < -180 || longitude > 180) {
      return Response.json({ error: "valid longitude is required" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
    if (access.error) return access.error;
    if (access.participantRole !== "donor" || access.match.donor_id !== auth.user.sub) {
      return Response.json({ error: "Only the accepted donor can update tracking" }, { status: 403 });
    }
    if (access.match.arrived_at && status !== "arrived") {
      return Response.json({ error: "Location updates are closed after arrival" }, { status: 409 });
    }

    const travel = calculateTravel(latitude, longitude, access.bloodRequest);
    const now = new Date().toISOString();

    const matchUpdate = {};
    if (!access.match.on_the_way_at) matchUpdate.on_the_way_at = now;
    if (status === "arrived" && !access.match.arrived_at) matchUpdate.arrived_at = now;

    if (Object.keys(matchUpdate).length) {
      const { error: updateError } = await supabase
        .from("matches")
        .update(matchUpdate)
        .eq("id", matchId)
        .eq("donor_id", auth.user.sub)
        .eq("match_status", "Accepted");

      if (updateError) throw updateError;
    }

    const { data: location, error } = await supabase
      .from("donor_locations")
      .insert({
        match_id: matchId,
        donor_id: auth.user.sub,
        latitude,
        longitude,
        distance_km: travel.distance_km,
        eta_minutes: status === "arrived" ? 0 : travel.eta_minutes,
        status,
      })
      .select("id, match_id, donor_id, latitude, longitude, distance_km, eta_minutes, status, created_at")
      .single();

    if (error) throw error;

    return Response.json({ location });
  } catch (err) {
    console.error("[POST /api/matches/tracking]", err);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
