import { monthShort } from "./calendarNames";

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// "fixture-nikoh-shartnomasi" → "Nikoh shartnomasi" (lib/lawyers.ts humanizeSlug).
export function humanizeSlug(s: string): string {
  const cleaned = (s || "")
    .replace(/^(fixture|service|area|category)[-_]/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : s;
}

// "26 okt 2026" / "26 окт. 2026" / "26 Oct 2026" in the device's time zone (calendarNames: Hermes has no Uzbek calendar data).
export function fmtDate(iso: string | undefined, locale = "uz"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${monthShort(d.getMonth(), locale)} ${d.getFullYear()}`;
}

export function fmtTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// "2026-10-10 14:05" in the device's time zone.
export function fmtDateTime(iso: string | undefined, locale = "uz"): string {
  const d = fmtDate(iso, locale);
  return d ? `${d} · ${fmtTime(iso)}` : "";
}

// Local calendar day as YYYY-MM-DD (what the API's date_from / date_to take).
export const isoDay = (d: Date = new Date()): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const daysAgo = (n: number): string => isoDay(new Date(Date.now() - n * 86_400_000));

export function timeAgo(iso: string | undefined, t: (key: string, p?: Record<string, string | number>) => string): string {
  const ms = iso ? Date.now() - new Date(iso).getTime() : NaN;
  if (!Number.isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return t("admSt.ago.now");
  if (m < 60) return t("admSt.ago.min", { n: m });
  const h = Math.floor(m / 60);
  return h < 24 ? t("admSt.ago.hour", { n: h }) : t("admSt.ago.day", { n: Math.floor(h / 24) });
}

// "4.9" / "4,9" like fmtRating() on the web (one decimal, the locale's separator).
export const fmtRating = (n: number, locale = "uz"): string => n.toFixed(1).replace(".", locale === "ru" ? "," : ".");
