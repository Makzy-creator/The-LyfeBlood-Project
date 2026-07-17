import { createClient } from "@supabase/supabase-js";
import { getBearerToken, requireAuth } from "@/app/api/utils/auth";
import { loadAcceptedPatientDonorMatch } from "@/app/api/utils/match-access";
import {
  createSupabaseServerClient,
  getSupabaseConfig,
} from "@/app/api/utils/supabase";

const TRAVEL_STATUSES = new Set(["on_the_way", "arrived"]);

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getMatchId(request) {
  return new URL(request.url).searchParams.get("match_id");
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

export async function GET(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;

    const matchId = getMatchId(request);
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
    if (access.error) return access.error;

    const userSupabase = createUserSupabaseClient(request);
    const { data: locations, error } = await userSupabase
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

    const userSupabase = createUserSupabaseClient(request);
    const { data: result, error } = await userSupabase.rpc("update_tracking", {
      p_match_id: matchId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_status: status,
    });

    if (error) throw error;

    return Response.json({ location: result?.location ?? null });
  } catch (err) {
    console.error("[POST /api/matches/tracking]", err);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
