import { fmtDate, fmtTime } from "@/shared/lib/format";

type Tr = (key: string) => string;
const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** Inbox timestamp: today → 14:05, yesterday → "Kecha", older → date. */
export function listStamp(iso: string, t: Tr, locale: string): string {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (same(d, now)) return fmtTime(iso);
  if (same(d, new Date(now.getTime() - 86_400_000))) return t("ms1.yesterday");
  return fmtDate(iso, locale);
}
