// Whole calendar days from today to a deadline (0 today, negative once past); 0 for no / invalid date. `now` is injectable for tests.
export function daysLeft(deadlineAt: string, now = Date.now()): number {
  const at = Date.parse(deadlineAt);
  if (!deadlineAt || Number.isNaN(at)) return 0;
  const a = new Date(at);
  const n = new Date(now);
  return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())) / 86_400_000);
}
