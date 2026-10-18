import * as Notifications from "expo-notifications";
import { readPermission } from "./permission";

export type Reminder = { id: string; title: string; body: string; at: Date; data: Record<string, string> };

const PREFIX = "cal-";
const MAX = 50; // iOS keeps at most 64 pending local notifications

/** Replaces every pending `cal-*` reminder with the given future ones (idempotent, safe to re-run). */
export async function syncReminders(list: Reminder[]): Promise<number> {
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(pending.filter((p) => p.identifier.startsWith(PREFIX)).map((p) => Notifications.cancelScheduledNotificationAsync(p.identifier)));
    if (!list.length || (await readPermission()).status !== "granted") return 0;
    const now = Date.now();
    const due = list.filter((r) => r.at.getTime() > now + 5000).sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX);
    for (const r of due) {
      await Notifications.scheduleNotificationAsync({
        identifier: PREFIX + r.id,
        content: { title: r.title, body: r.body, data: { local: true, event: "calendar_event", category: "system", ...r.data } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: "default" },
      });
    }
    return due.length;
  } catch {
    return 0;
  }
}
