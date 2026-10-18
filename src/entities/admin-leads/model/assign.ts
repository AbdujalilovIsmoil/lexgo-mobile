import type { Lead } from "./types";

// Details as the PATCH must send them: the kanban key is the server's own (a stale copy would
// put the lead back into the column it was loaded in), so it is left out and kept server-side.
export const plainDetails = (details: Record<string, unknown>): Record<string, unknown> => Object.fromEntries(Object.entries(details).filter(([k]) => k !== "kanban"));

// Details with the assignment set (userId) or cleared (""). The web reads these keys.
function assignedDetails(details: Record<string, unknown>, userId: string, byUserId: string, at: string): Record<string, unknown> {
  const next: Record<string, unknown> = { ...details };
  delete next.assigned_to_user_id;
  delete next.assigned_at;
  delete next.assigned_by;
  return userId ? { ...next, assigned_to_user_id: userId, assigned_at: at, assigned_by: byUserId } : next;
}

// PATCH body: the backend's own operator column plus the mirrored details (so the web board agrees).
export const assignPatch = (lead: Lead, userId: string, byUserId: string, at: string) => ({
  assigned_operator_user_id: userId,
  details: assignedDetails(plainDetails(lead.details), userId, byUserId, at),
});

// The lead as it will look once the assignment is saved.
export const withAssignment = (lead: Lead, userId: string, byUserId: string, at: string): Lead => ({
  ...lead,
  details: assignedDetails(lead.details, userId, byUserId, at),
  assignedTo: userId,
  assignedAt: userId ? at : "",
  assignedBy: userId ? byUserId : "",
});
