import type { PendingPromo, Placement, Running } from "../model/types";

export type PlacementState = { kind: "off" } | { kind: "pending" } | { kind: "active"; daysLeft: number };

// Where a placement stands for the seller: running (longest days left wins), waiting for the Telegram approval, or off.
export function placementState(placement: Placement, running: Running[], pending: PendingPromo[]): PlacementState {
  const live = running.filter((r) => r.placement === placement);
  if (live.length) return { kind: "active", daysLeft: Math.max(...live.map((r) => r.daysLeft)) };
  const waits = pending.some((p) => (placement === "service_boost" ? p.target.startsWith("service:") : p.target === placement));
  return waits ? { kind: "pending" } : { kind: "off" };
}
