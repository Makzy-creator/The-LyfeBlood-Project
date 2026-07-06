/**
 * POST /api/matches/respond
 * Body: { match_id: string, decision: 'Accepted' | 'Declined' }
 */
import { createSupabaseServerClient } from "@/app/api/utils/supabase";
import { requireAuth } from "@/app/api/utils/auth";
import { generateOtp, getOtpTtlMinutes, getOtpTtlSeconds, hashOtp } from "@/app/api/utils/otp";
import {
  createNotifications,
  requestRecipientIds,
} from "@/app/api/utils/notifications";

function minutesFromNow(n) {
  return new Date(Date.now() + n * 60_000).toISOString();
}

export async function POST(request) {
  try {
    const auth = requireAuth(request, ["donor"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { match_id, decision } = body;

    if (!match_id) {
      return Response.json({ error: "match_id is required" }, { status: 400 });
    }
    if (!["Accepted", "Declined"].includes(decision)) {
      return Response.json(
        { error: "decision must be Accepted or Declined" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", match_id)
      .eq("donor_id", auth.user.sub)
      .maybeSingle();

    if (matchError) throw matchError;
    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }
    if (match.match_status !== "Alerted") {
      return Response.json(
        { error: "Match already responded to" },
        { status: 409 },
      );
    }

    if (decision === "Declined") {
      const { error } = await supabase
        .from("matches")
        .update({
          match_status: "Declined",
          responded_at: new Date().toISOString(),
        })
        .eq("id", match_id)
        .eq("donor_id", auth.user.sub);

      if (error) throw error;

      const { data: bloodRequest, error: requestError } = await supabase
        .from("blood_requests")
        .select("id, hospital_name, blood_type_needed, requested_by, hospital_id")
        .eq("id", match.request_id)
        .single();

      if (requestError) throw requestError;

      await createNotifications(supabase, [
        {
          user_id: auth.user.sub,
          type: "match_declined",
          title: "Match declined",
          message: `You declined the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
          request_id: bloodRequest.id,
          match_id,
        },
        ...requestRecipientIds(bloodRequest).map((userId) => ({
          user_id: userId,
          type: "match_declined",
          title: "Donor declined",
          message: `A donor declined the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
          request_id: bloodRequest.id,
          match_id,
        })),
      ]);

      return Response.json({
        message: "Match declined",
        match_id,
        status: "Declined",
      });
    }

    const otp = generateOtp();
    const expiresAt = minutesFromNow(getOtpTtlMinutes());

    const { error: updateMatchError } = await supabase
      .from("matches")
      .update({
        match_status: "Accepted",
        responded_at: new Date().toISOString(),
      })
      .eq("id", match_id)
      .eq("donor_id", auth.user.sub);

    if (updateMatchError) throw updateMatchError;

    const { data: updatedRequest, error: updateRequestError } = await supabase
      .from("blood_requests")
      .update({ status: "donor_matched" })
      .eq("id", match.request_id)
      .select("id, status")
      .single();

    if (updateRequestError) throw updateRequestError;

    const { data: token, error: tokenError } = await supabase
      .from("verification_tokens")
      .insert({
        match_id,
        secure_otp: hashOtp(otp),
        expires_at: expiresAt,
        status: "Active",
      })
      .select("id, match_id, expires_at, status")
      .single();

    if (tokenError) throw tokenError;

    const { data: bloodRequest, error: requestLookupError } = await supabase
      .from("blood_requests")
      .select("id, hospital_name, blood_type_needed, requested_by, hospital_id")
      .eq("id", match.request_id)
      .single();

    if (requestLookupError) throw requestLookupError;

    await createNotifications(supabase, [
      {
        user_id: auth.user.sub,
        type: "match_accepted",
        title: "Match accepted",
        message: `You accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id,
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "match_accepted",
        title: "Donor accepted",
        message: `A donor accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id,
      })),
    ]);

    return Response.json({
      message: "Match accepted",
      match_id,
      status: "Accepted",
      otp,
      expires_at: expiresAt,
      otp_ttl_seconds: getOtpTtlSeconds(),
      token_id: token?.id ?? null,
      request: updatedRequest ?? null,
    });
  } catch (err) {
    console.error("[POST /api/matches/respond]", err);
    return Response.json({ error: "Failed to update match" }, { status: 500 });
  }
}
