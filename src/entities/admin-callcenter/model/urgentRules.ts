import type { UrgentRequest } from "./urgentTypes";

// A record with no further statuses is final (completed / cancelled / expired).
export const isFinal = (r: UrgentRequest): boolean => r.nextStatuses.length === 0 && r.status !== "open_pool";
export const isOpen = (r: UrgentRequest): boolean => (r.status || "open_pool") === "open_pool";

// Claiming: free records, or (admins) taking over a record another operator holds.
export function claimMode(r: UrgentRequest, meId: string, admin: boolean): "claim" | "takeover" | "" {
  const open = r.status === "open_pool" || r.nextStatuses.includes("claimed");
  if (open && r.claimedByUserId && r.claimedByUserId !== meId && admin) return "takeover";
  return open && !r.claimedByUserId ? "claim" : "";
}

// The statuses an operator may set by hand: the record's own next_statuses, minus the ones with dedicated forms
// (completed needs a result, cancelled a reason) and "claimed" unless the operator already holds it.
export function statusChoices(r: UrgentRequest, meId: string): string[] {
  const mine = !!r.claimedByUserId && r.claimedByUserId === meId;
  return r.nextStatuses.filter((s) => s !== "completed" && s !== "cancelled" && (s !== "claimed" || mine));
}
