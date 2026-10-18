import { asDict, asStr } from "@/shared/lib/json";
import { categoryOf } from "../model/classify";
import type { Notification } from "../model/types";

// Delivery channels the backend writes into `kind`; anything else in `kind` / `type` is the event itself.
export const CHANNELS = ["in_app", "push", "telegram", "email", "sms", "secure_chat", "meeting_invite"];

// Handles both shapes: staging rows (`kind` = delivery channel, event in data.event / meta.event)
// and the TZ 28 payload (type, entity_type, entity_id, deep_link, metadata, read_at).
export function normNotification(v: unknown): Notification {
  const d = asDict(v);
  const data = { ...asDict(d.meta ?? d.metadata), ...asDict(d.data) };
  const kind = asStr(d.kind ?? d.type).trim();
  const isChannel = CHANNELS.includes(kind);
  const channel = asStr(d.channel).trim() || (isChannel ? kind : "");
  const event = asStr(data.event ?? d.event ?? d.event_type) || (kind && !isChannel ? kind : "");
  const id = asStr(d.id);
  const title = asStr(d.title);
  const channels = channel ? [channel] : [];
  // POST /admin/notifications stores its category on the row itself ("system" is only the default).
  const top = asStr(d.category).trim().toLowerCase();
  const explicit = top && top !== "system" ? { category: top } : {};
  const read = typeof d.read === "boolean" ? d.read : typeof d.is_read === "boolean" ? d.is_read : !!d.read_at || asStr(d.status) === "read";
  return {
    id,
    ids: id ? [id] : [],
    title,
    body: asStr(d.body ?? d.message),
    category: categoryOf(event, channels, title, { ...explicit, ...data }),
    event,
    channels,
    data,
    entityType: asStr(d.entity_type ?? data.entity_type),
    entityId: asStr(d.entity_id ?? data.entity_id),
    deepLink: asStr(d.deep_link ?? data.deep_link),
    read,
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}
