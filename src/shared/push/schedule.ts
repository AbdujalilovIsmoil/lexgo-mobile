import * as Notifications from "expo-notifications";
import { track } from "@/shared/analytics";
import { channelOf } from "./channels";
import { readPermission } from "./permission";

export type LocalAlert = { id: string; title: string; body: string; category: string; event: string; data: Record<string, unknown>; ids?: string[]; sound?: boolean; delaySec?: number; actions?: string };

// Only these payload keys travel inside an OS notification (ids needed to open the right screen;
// no phones, names or message text — the lock screen can be read by anyone).
const ROUTE_KEYS = ["room_id", "call_id", "order_id", "document_request_id", "record_id", "ticket_id", "payment_id", "work_id", "service_id", "complaint_id", "plan_id", "secure_chat_room_id", "session_id", "entity_type", "entity_id", "deep_link", "status"];

export function routeData(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ROUTE_KEYS) if (typeof data[k] === "string" && data[k]) out[k] = data[k] as string;
  return out;
}

/** Shows an OS notification right now. The same id replaces an earlier one (no duplicates). */
export async function showLocalAlert(a: LocalAlert): Promise<boolean> {
  const perm = await readPermission();
  if (perm.status !== "granted") return false;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: a.id,
      content: { title: a.title, body: a.body, data: { local: true, event: a.event, category: a.category, nids: (a.ids ?? []).slice(0, 8).join(","), ...routeData(a.data) }, sound: a.sound === false ? false : "default", ...(a.actions ? { categoryIdentifier: a.actions } : {}) },
      trigger: a.delaySec ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: a.delaySec, channelId: channelOf(a.category, a.event) } : { channelId: channelOf(a.category, a.event) },
    });
    track("local_alert", { event: a.event, category: a.category });
    return true;
  } catch {
    return false;
  }
}

export const clearDelivered = (): void => void Notifications.dismissAllNotificationsAsync().catch(() => {});

/** Takes away every delivered notification of one call (a local ring or the remote push), whatever its identifier. */
export async function dismissCallAlerts(callId: string): Promise<void> {
  try {
    const shown = await Notifications.getPresentedNotificationsAsync();
    const mine = shown.filter((n) => n.request.identifier === `call-${callId}` || n.request.identifier === callId || (n.request.content.data as Record<string, unknown> | undefined)?.call_id === callId);
    await Promise.all(mine.map((n) => Notifications.dismissNotificationAsync(n.request.identifier)));
  } catch {
    /* nothing shown, or notifications unavailable */
  }
}
