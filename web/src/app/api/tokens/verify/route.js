/**
 * POST /api/tokens/verify
 * Body: { otp: string, match_id: string }
 */
import { createSupabaseServerClient } from "@/app/api/utils/supabase";
import { getCanonicalRole, requireAuth } from "@/app/api/utils/auth";
import { verifyOtpHash } from "@/app/api/utils/otp";
import {
  createNotifications,
  requestRecipientIds,
} from "@/app/api/utils/notifications";

export async function POST(request) {
  try {
    const auth = requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const role = getCanonicalRole(auth.user.role);

    const body = await request.json();
    const { otp, match_id } = body;

    const normalizedOtp = String(otp ?? "").trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return Response.json(
        { error: "A 6-digit OTP is required" },
        { status: 400 },
      );
    }
    if (!match_id) {
      return Response.json(
        { error: "match_id is required for check-in verification" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const now = new Date().toISOString();

    await supabase
      .from("verification_tokens")
      .update({ status: "Expired" })
      .eq("status", "Active")
      .lt("expires_at", now);

    const { data: tokenRows, error: tokenLookupError } = await supabase
      .from("verification_tokens")
      .select("id, match_id, secure_otp, expires_at, status")
      .eq("match_id", match_id)
      .order("created_at", { ascending: false });
    if (tokenLookupError) throw tokenLookupError;

    const matchingToken = (tokenRows ?? []).find((row) =>
      verifyOtpHash(normalizedOtp, row.secure_otp),
    );
    if (matchingToken?.status === "Used") {
      return Response.json({ error: "OTP has already been used" }, { status: 409 });
    }
    if (matchingToken?.status === "Expired") {
      return Response.json({ error: "OTP has expired" }, { status: 401 });
    }

    const token =
      matchingToken?.status === "Active" ? matchingToken : null;
    if (!token) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 401 },
      );
    }

    if (new Date(token.expires_at) < new Date()) {
      const { error } = await supabase
        .from("verification_tokens")
        .update({ status: "Expired" })
        .eq("id", token.id);

      if (error) throw error;

      return Response.json({ error: "OTP has expired" }, { status: 401 });
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, request_id, donor_id, match_status")
      .eq("id", token.match_id)
      .single();

    if (matchError) throw matchError;
    if (match.match_status !== "Accepted") {
      return Response.json(
        { error: "Match is not ready for check-in" },
        { status: 409 },
      );
    }

    const { data: donor, error: donorError } = await supabase
      .from("users")
      .select("id, full_name, email, phone, blood_type, is_verified")
      .eq("id", match.donor_id)
      .single();

    if (donorError) throw donorError;
    if (!donor || (donor.is_verified !== true && donor.is_verified !== 1)) {
      return Response.json(
        { error: "Donor identity is not verified" },
        { status: 403 },
      );
    }

    const { data: bloodRequest, error: requestLookupError } = await supabase
      .from("blood_requests")
      .select("id, requested_by, hospital_id")
      .eq("id", match.request_id)
      .single();

    if (requestLookupError) throw requestLookupError;

    if (
      role !== "admin" &&
      bloodRequest?.requested_by !== auth.user.sub &&
      bloodRequest?.hospital_id !== auth.user.sub
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const checkedInAt = new Date().toISOString();
    const { data: usedToken, error: tokenUpdateError } = await supabase
      .from("verification_tokens")
      .update({
        status: "Used",
        used_at: checkedInAt,
        checked_in_at: checkedInAt,
        verified_by: auth.user.sub,
      })
      .eq("id", token.id)
      .eq("status", "Active")
      .select("id")
      .maybeSingle();

    if (tokenUpdateError) throw tokenUpdateError;
    if (!usedToken) {
      return Response.json({ error: "OTP has already been used" }, { status: 409 });
    }

    const { data: arrivedRequest, error: requestUpdateError } = await supabase
      .from("blood_requests")
      .update({ status: "checked_in" })
      .eq("id", match.request_id)
      .select("id, status, hospital_name, blood_type_needed")
      .single();

    if (requestUpdateError) throw requestUpdateError;

    await createNotifications(supabase, [
      {
        user_id: donor.id,
        type: "otp_checked_in",
        title: "Check-in verified",
        message: `Your arrival at ${arrivedRequest.hospital_name} was verified.`,
        request_id: match.request_id,
        match_id: match.id,
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "otp_checked_in",
        title: "Donor checked in",
        message: `${donor.full_name ?? "A donor"} checked in for ${arrivedRequest.blood_type_needed}.`,
        request_id: match.request_id,
        match_id: match.id,
      })),
    ]);

    return Response.json({
      message: "Check-in verified. Donor arrival confirmed.",
      token_id: token.id,
      request_id: match.request_id,
      request: arrivedRequest ?? null,
      donor,
      checked_in_at: checkedInAt,
      verified_by: auth.user.sub,
      new_status: "checked_in",
    });
  } catch (err) {
    console.error("[POST /api/tokens/verify]", err);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
