import type { Task } from "../model/typesWork";

const COLOR: Record<string, string> = {
  done: "#22C55E", present: "#22C55E", active: "#22C55E", approved: "#22C55E", paid: "#22C55E", completed: "#22C55E",
  accepted: "#3B82F6", in_progress: "#3B82F6", sent: "#3B82F6",
  new: "#F59E0B", pending: "#F59E0B", in_review: "#8B5CF6", returned: "#F59E0B", paused: "#64748B", late: "#F59E0B",
  cancelled: "#EF4444", rejected: "#EF4444", absent: "#EF4444", inactive: "#64748B",
};

// Strip colour of a status (green done / blue running / amber waiting / red failed).
export const statusColor = (status: string): string => COLOR[status.trim().toLowerCase()] ?? "#64748B";

// A task past its deadline that is still open.
export const isOverdue = (x: Task): boolean => !!x.deadline && x.status !== "done" && x.status !== "cancelled" && new Date(x.deadline).getTime() < Date.now();
