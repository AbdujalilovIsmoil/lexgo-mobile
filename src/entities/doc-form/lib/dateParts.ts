export type YMD = { y: number; m: number; d: number };

export const daysIn = (y: number, m: number): number => new Date(y, m, 0).getDate();
const pad = (n: number, w = 2) => String(n).padStart(w, "0");

// "21.09.2026" → parts, or null when it is not a real calendar day.
export function parseDoc(v: string): YMD | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v.trim());
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mo >= 1 && mo <= 12 && y >= 1000 && d >= 1 && d <= daysIn(y, mo) ? { y, m: mo, d } : null;
}

export const fmtDoc = ({ y, m, d }: YMD): string => `${pad(d)}.${pad(m)}.${pad(y, 4)}`;

// Digits only; a dot appears once the next part starts (DD.MM.YYYY).
export function maskDoc(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join(".");
}

export const today = (): YMD => {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
};

// Monday-first grid of a month: leading blanks (null) then 1..N.
export function monthCells(y: number, m: number): (number | null)[] {
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  return [...Array<null>(lead).fill(null), ...Array.from({ length: daysIn(y, m) }, (_, i) => i + 1)];
}
