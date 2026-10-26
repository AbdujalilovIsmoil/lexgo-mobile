import type { UrgentRequest } from "./requestTypes";

export type Stage = "active" | "completed" | "cancelled";
const FINAL = ["completed", "cancelled", "expired"];

export const isFinal = (r: UrgentRequest): boolean => FINAL.includes(r.status);
export const isOpen = (r: UrgentRequest): boolean => (r.status || "open_pool") === "open_pool";
export const stageOf = (r: UrgentRequest): Stage => (r.status === "completed" ? "completed" : r.status === "cancelled" || r.status === "expired" ? "cancelled" : "active");
export const isGroupKind = (r: { serviceKind: string }): boolean => r.serviceKind === "second_opinion_group";

// The backend's lifecycle is the authority: a transition button exists only when next_statuses lists it.
export const canCancel = (r: UrgentRequest): boolean => r.nextStatuses.includes("cancelled");
export const canComplete = (r: UrgentRequest): boolean => r.nextStatuses.includes("completed");
export const ratingOpen = (r: UrgentRequest): boolean => r.rating.available && !r.rating.submitted;
// A meeting can be entered once the record carries both the room and the call.
export const joinable = (r: UrgentRequest): boolean => !!r.callId && !!r.roomId && !isFinal(r);
export const hasMeeting = (r: UrgentRequest): boolean => !!r.scheduledAt && (r.status === "scheduled" || r.status === "meeting_active");

// A free record may be claimed (taking over one somebody holds is the call centre's, in the web panel).
export const canClaim = (r: UrgentRequest): boolean => (isOpen(r) || r.nextStatuses.includes("claimed")) && !r.claimedByUserId;

// Statuses an operator may set by hand: the record's own next_statuses minus the ones with dedicated forms.
export function statusChoices(r: UrgentRequest, meId: string): string[] {
  const mine = !!r.claimedByUserId && r.claimedByUserId === meId;
  return r.nextStatuses.filter((s) => s !== "completed" && s !== "cancelled" && (s !== "claimed" || mine));
}

// The viewer is one of the advocates on the record (assigned, claimer or panel member) — never the client.
export const isAdvocateOn = (r: UrgentRequest, meId: string): boolean =>
  !!meId && (r.assignedLawyerUserId === meId || r.claimedByUserId === meId || r.groupLawyerUserIds.includes(meId));
