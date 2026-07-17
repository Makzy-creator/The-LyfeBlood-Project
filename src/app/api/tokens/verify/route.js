/**
 * POST /api/tokens/verify
 * Body: { otp: string, match_id: string }
 */
import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseServerClient,
  getSupabaseConfig,
} from "@/app/api/utils/supabase";
import { getBearerToken, requireAuth } from "@/app/api/utils/auth";
import { verifyOtpHash } from "@/app/api/utils/otp";
import {
  createNotifications,
  requestRecipientIds,
} from "@/app/api/utils/notifications";

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

function rpcErrorResponse(error) {
  const message = error?.message ?? "Verification failed";
  if (message.includes("already been used")) {
    return Response.json({ error: message }, { status: 409 });
  }
  if (message.includes("expired") || message.includes("Invalid")) {
    return Response.json({ error: message }, { status: 401 });
  }
  if (message.includes("Forbidden") || message.includes("not verified")) {
    return Response.json({ error: message }, { status: 403 });
  }
  if (message.includes("not ready")) {
    return Response.json({ error: message }, { status: 409 });
  }
  return Response.json({ error: "Verification failed" }, { status: 500 });
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;

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

    const userSupabase = createUserSupabaseClient(request);
    const { data: result, error: verifyError } = await userSupabase.rpc("verify_donor_otp", {
      p_token_id: String(token.id),
      p_match_id: match_id,
      p_verified_by: auth.user.sub,
    });

    if (verifyError) throw verifyError;

    const match = result?.match;
    const arrivedRequest = result?.request;
    const bloodRequest = result?.request;
    const donor = result?.donor;

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
      checked_in_at: result?.checked_in_at,
      verified_by: auth.user.sub,
      new_status: "checked_in",
    });
  } catch (err) {
    console.error("[POST /api/tokens/verify]", err);
    return rpcErrorResponse(err);
  }
}
