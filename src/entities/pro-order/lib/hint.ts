import type { ProOrder } from "../model/types";
import { actionsOf } from "./moves";
import { stageOf } from "./stage";

export type OrderHint = "accept" | "complete" | "work" | "paused";

// The one thing the seller should do next with this order, or null when nothing is waiting on them.
export function hintOf(o: ProOrder): OrderHint | null {
  const a = actionsOf(o);
  if (a.paused) return "paused";
  if (a.accept) return "accept";
  if (a.complete) return "complete";
  // Work under way (or ready to begin) — but not while the client's advance still keeps contact locked.
  return a.start || a.review || (stageOf(o) === "active" && o.flow?.contactUnlocked !== false) ? "work" : null;
}
