// Whole calendar days from `now` to a deadline day ("YYYY-MM-DD" or an ISO time): 0 today, negative once it has passed.
export function daysTo(deadline: string, now = Date.now()): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(deadline);
  if (!m) return 0;
  const n = new Date(now);
  const a = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const b = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((a - b) / 86_400_000);
}
