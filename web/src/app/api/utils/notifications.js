function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function requestRecipientIds(request) {
  return unique([request?.requested_by, request?.hospital_id]);
}

export async function createNotifications(supabase, notifications) {
  const rows = (notifications ?? [])
    .filter((notification) => notification?.user_id)
    .map((notification) => ({
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      request_id: notification.request_id ?? null,
      match_id: notification.match_id ?? null,
      deliver_at: notification.deliver_at ?? new Date().toISOString(),
    }));

  if (!rows.length) return { count: 0 };

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) throw error;
  return { count: rows.length };
}

export async function notifyRequestRecipients(supabase, request, notification) {
  return createNotifications(
    supabase,
    requestRecipientIds(request).map((userId) => ({
      ...notification,
      user_id: userId,
      request_id: notification.request_id ?? request?.id ?? null,
    })),
  );
}
