const KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const p = (n: number) => String(n).padStart(2, "0");

// Tashkent wall-clock "DD.MM.YYYY, HH:MM (Mon)" for an ISO timestamp (UTC+5, no DST).
export function tashkentText(iso: string, dayName: (key: string) => string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const d = new Date(ms + 5 * 3600 * 1000);
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} (${dayName(KEYS[d.getUTCDay()])})`;
}

// "2030" → "20:30", "9" → "9"; digits only, a colon is added after the hours.
export const maskTime = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
};
export const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
