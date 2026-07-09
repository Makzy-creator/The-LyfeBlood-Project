import { requireAuth } from "@/app/api/utils/auth";
import { loadAcceptedPatientDonorMatch } from "@/app/api/utils/match-access";
import { createSupabaseServerClient } from "@/app/api/utils/supabase";

const QUICK_REPLIES = {
  on_the_way: "I'm on my way",
  delayed: "I'm delayed",
  arrived: "I've arrived",
};

function getMatchId(request) {
  return new URL(request.url).searchParams.get("match_id");
}

export async function GET(request) {
  try {
    const auth = requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;

    const matchId = getMatchId(request);
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
    if (access.error) return access.error;

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("id, match_id, sender_id, message, quick_type, created_at")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    return Response.json({
      messages: messages ?? [],
      match: access.match,
      request: access.bloodRequest,
      participant_role: access.participantRole,
      quick_replies: QUICK_REPLIES,
    });
  } catch (err) {
    console.error("[GET /api/matches/chat]", err);
    return Response.json({ error: "Failed to load chat" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const matchId = body.match_id;
    const quickType = body.quick_type ?? null;
    const quickMessage = quickType ? QUICK_REPLIES[quickType] : null;
    const message = (quickMessage ?? String(body.message ?? "")).trim();

    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }
    if (message.length > 500) {
      return Response.json({ error: "message must be 500 characters or fewer" }, { status: 400 });
    }
    if (quickType && !quickMessage) {
      return Response.json({ error: "quick_type is invalid" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
    if (access.error) return access.error;

    const { data: insertedMessage, error } = await supabase
      .from("chat_messages")
      .insert({
        match_id: matchId,
        sender_id: auth.user.sub,
        message,
        quick_type: quickType,
      })
      .select("id, match_id, sender_id, message, quick_type, created_at")
      .single();

    if (error) throw error;

    if (access.participantRole === "donor" && quickType === "on_the_way" && !access.match.on_the_way_at) {
      await supabase
        .from("matches")
        .update({ on_the_way_at: new Date().toISOString() })
        .eq("id", matchId)
        .eq("donor_id", auth.user.sub);
    }

    if (access.participantRole === "donor" && quickType === "arrived" && !access.match.arrived_at) {
      await supabase
        .from("matches")
        .update({ arrived_at: new Date().toISOString() })
        .eq("id", matchId)
        .eq("donor_id", auth.user.sub);
    }

    return Response.json({ message: insertedMessage });
  } catch (err) {
    console.error("[POST /api/matches/chat]", err);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
