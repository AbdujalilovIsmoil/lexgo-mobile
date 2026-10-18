import type { UserEvent } from "@/shared/realtime";
import { asStr } from "@/shared/lib/json";

// Which sentence an `urgent_advokat.*` frame deserves. The status in the frame wins over the event name, so
// whichever way the backend names a move ("status_changed", "updated" …) the user hears the same thing.
const BY_STATUS: Record<string, string> = { claimed: "claimed", scheduled: "scheduled", meeting_active: "meeting", completed: "completed", cancelled: "cancelled", expired: "cancelled" };
const BY_NAME: [RegExp, string][] = [
  [/express_call_started/, "call"],
  [/meeting/, "meeting"],
  [/transferred/, "transferred"],
  [/assist_urgent_advokat_request_created/, "assist"],
  [/claimed/, "claimed"],
  [/(group_assigned|scheduled)/, "scheduled"],
  [/completed/, "completed"],
  [/(cancelled|canceled)/, "cancelled"],
  [/(created|open_pool)/, "created"],
];

export function eventKey(e: UserEvent): string {
  const name = e.event.replace(/^(support\.|urgent_advokat\.)/, "");
  const byName = BY_NAME.find(([re]) => re.test(name))?.[1];
  return byName ?? BY_STATUS[asStr(e.status)] ?? "";
}
