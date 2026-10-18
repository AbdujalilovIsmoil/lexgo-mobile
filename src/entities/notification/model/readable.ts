import { humanizeSlug } from "@/shared/lib/format";
import { asStr } from "@/shared/lib/json";
import type { Notification } from "./types";

type T = (key: string, params?: Record<string, string | number>) => string;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// Event status → words: the notification's own list, then the order statuses, then a tidied slug.
export function statusText(status: string, t: T): string {
  for (const key of [`notif.st.${status}`, `profile.status.${status}`]) if (t(key) !== key) return t(key);
  return humanizeSlug(status);
}

// The backend text quotes raw ids and status words ("Buyurtma: 3e3a… Holat: new").
// Show the public order number instead of the uuid and the translated status.
export function readableBody(n: Notification, t: T, workId: string): string {
  const status = asStr(n.data.status);
  let body = n.body;
  body = workId ? body.replace(new RegExp(UUID, "gi"), workId) : body.replace(new RegExp(`[^\\s:]+:\\s*${UUID}\\s*`, "gi"), "");
  if (status) body = body.replace(new RegExp(`\\b${status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), statusText(status, t));
  return body.replace(/\s{2,}/g, " ").trim();
}
