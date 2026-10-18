import type { DayKey, JournalEntry } from "@/entities/security";
import { fmtDate } from "@/shared/lib/format";

type T = (key: string, p?: Record<string, string | number>) => string;

// Human title of an entry: a known translation, else the server's Uzbek title, else the raw key made readable.
export function entryTitle(e: JournalEntry, t: T, locale: string): string {
  const key = `admSecC.${e.source === "event" ? "ev" : "act"}.${e.key}`;
  const known = t(key);
  if (known !== key) return known;
  if (locale === "uz" && e.title) return e.title;
  const plain = (e.title || e.key).replace(/[_.-]+/g, " ").trim();
  return plain ? plain.charAt(0).toUpperCase() + plain.slice(1) : "—";
}

export const entryRoute = (e: JournalEntry): string => (e.fromIp && e.ip ? `${e.fromIp} → ${e.ip}` : e.ip || e.fromIp);

// One-line subtitle: device / detail, then the address.
export const entrySubtitle = (e: JournalEntry): string => [e.agent || e.detail, entryRoute(e)].filter(Boolean).join(" · ");

export function dayLabel(d: DayKey, t: T, locale: string): string {
  return d.kind === "today" ? t("secUx.today") : d.kind === "yesterday" ? t("secUx.yesterday") : fmtDate(d.kind === "date" && d.iso ? `${d.iso}T12:00:00` : "", locale);
}
