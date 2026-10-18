import { fmtDate, timeAgo } from "@/shared/lib/format";

const WEEK = 7 * 86_400_000;

// "5 daq oldin" for the last week, a calendar date after that.
export function whenText(iso: string, t: (key: string, p?: Record<string, string | number>) => string, locale: string): string {
  if (!iso) return "";
  const recent = Date.now() - new Date(iso).getTime() < WEEK;
  return recent ? timeAgo(iso, t) : fmtDate(iso, locale);
}
