import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "./countries";

// Uzbek phone helpers (mirrors lib/phone.ts on the web).
const DIGITS = /\D+/g;
const PREFIX = "+998";

// Local 9 digits from whatever is in the field or was pasted.
// A leading "+998" is the country code (what our own mask writes back, or a
// pasted international number); without a "+", digits are taken as typed, so a
// local number starting "998…" is never cut by mistake.
function localDigits(raw: string): string {
  const t = raw.trim();
  const d = t.replace(DIGITS, "");
  if (t.startsWith(PREFIX)) return d.slice(3);
  if (d.length > 9 && d.startsWith("998")) return d.slice(3);
  return d;
}

// "+998 90 123 45 67" | "998901234567" | "901234567" → "+998901234567"; "" when not 9 local digits.
export function normUzPhone(raw: string): string {
  const d = localDigits(raw);
  return d.length === 9 ? `${PREFIX}${d}` : "";
}

export const isUzPhone = (raw: string): boolean => normUzPhone(raw) !== "";

// Live input mask: "+998 90 123 45 67".
export function formatUzPhone(raw: string): string {
  const d = localDigits(raw).slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.length ? `${PREFIX} ${parts.join(" ")}` : `${PREFIX} `;
}

export function maskPhone(phone: string): string {
  const n = normUzPhone(phone);
  return n ? `${n.slice(0, 7)} *** ${n.slice(-2)}` : phone;
}

// ── International numbers ──────────────────────────────────────────────────────────────────────────────────────────────────
const MAX_TOTAL = 15; // E.164

/** The country a number belongs to, by the longest dial code it starts with (none typed = Uzbekistan), and the national digits after it. */
export function splitPhone(raw: string): { country: Country; national: string } {
  const t = raw.trim();
  const d = t.replace(DIGITS, "");
  if (!t.startsWith("+")) return { country: DEFAULT_COUNTRY, national: localDigits(raw) };
  const hit = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => d.startsWith(c.dial));
  return hit ? { country: hit, national: d.slice(hit.dial.length) } : { country: DEFAULT_COUNTRY, national: d };
}

const group = (digits: string, sizes: number[]): string => {
  const out: string[] = [];
  let i = 0;
  for (const n of sizes) { if (i >= digits.length) break; out.push(digits.slice(i, i + n)); i += n; }
  if (i < digits.length) out.push(digits.slice(i));
  return out.join(" ");
};

/** "+998 90 123 45 67" for an Uzbek number, "+7 912 345 67 89" for a Russian one … while typing; "+998 " when nothing is typed. */
export function formatIntl(country: Country, national: string): string {
  const max = Math.max(1, MAX_TOTAL - country.dial.length);
  const n = national.replace(DIGITS, "").slice(0, country.code === "UZ" ? 9 : max);
  return n ? `+${country.dial} ${group(n, country.groups)}` : `+${country.dial} `;
}

/** The same, from whatever was typed or pasted (the country is read from the leading "+dial"). */
export function formatAnyPhone(raw: string): string {
  const { country, national } = splitPhone(raw);
  return formatIntl(country, national);
}

/** "+<dial><national>" for a complete number (Uzbek: exactly 9 digits; others: 6–12 national digits), else "". */
export function normPhone(raw: string): string {
  const { country, national } = splitPhone(raw);
  if (country.code === "UZ") return national.length === 9 ? `+998${national}` : "";
  return national.length >= 6 && national.length <= Math.min(12, MAX_TOTAL - country.dial.length) ? `+${country.dial}${national}` : "";
}

export const isPhone = (raw: string): boolean => normPhone(raw) !== "";
