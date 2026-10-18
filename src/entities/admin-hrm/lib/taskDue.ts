// Task helpers for the redesigned rows: open / overdue checks and one colour per status.
export const isOpenTask = (x: { status: string }): boolean => x.status !== "done" && x.status !== "cancelled";

export const STATUS_TINT: Record<string, string> = {
  new: "#F59E0B", accepted: "#3B82F6", in_progress: "#06B6D4", in_review: "#8B5CF6",
  done: "#22C55E", returned: "#F97316", paused: "#64748B", cancelled: "#94A3B8",
};

// Whole days the deadline is past (0 = not overdue or no deadline).
export function daysOverdue(x: { status: string; deadline: string }, now: number = Date.now()): number {
  if (!x.deadline || !isOpenTask(x)) return 0;
  const d = new Date(x.deadline).getTime();
  return Number.isNaN(d) || d >= now ? 0 : Math.max(1, Math.floor((now - d) / 86_400_000));
}

export const isToday = (iso: string): boolean => !!iso && new Date(iso).toDateString() === new Date().toDateString();
