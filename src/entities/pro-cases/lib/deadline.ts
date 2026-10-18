export type Due = "overdue" | "today" | "soon" | "later" | "none";
const DAY = 86_400_000;

// How near a case's deadline is: past (and still open), today, within three days, later, or none. `now` is injectable for tests.
export function dueOf(deadlineAt: string, closed: boolean, now = Date.now()): Due {
  const at = Date.parse(deadlineAt);
  if (!deadlineAt || Number.isNaN(at) || closed) return "none";
  const d = new Date(now);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (at < start) return "overdue";
  if (at < start + DAY) return "today";
  return at < start + 4 * DAY ? "soon" : "later";
}
