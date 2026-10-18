const pad = (n: number) => String(n).padStart(2, "0");

// Local calendar day (YYYY-MM-DD) of an ISO timestamp; "" when it is not a date.
export function dayKey(iso: string | undefined): string {
  const d = new Date(iso ?? "");
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const keyOf = (y: number, m: number, d: number): string => `${y}-${pad(m + 1)}-${pad(d)}`;

// "HHMM" typed digits → "HH:MM".
export function maskTime(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}
// A real calendar day typed as YYYY-MM-DD (rejects 2026-13-45).
export const isDay = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
export const isTime = (v: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

// "2026-10-31" + "09:30" → ISO instant in the device time zone.
export function toIso(day: string, time: string): string {
  return new Date(`${day}T${isTime(time) ? time : "09:00"}:00`).toISOString();
}

// "HH:MM" of an ISO timestamp in the device time zone.
export function hhmm(iso: string | undefined): string {
  const d = new Date(iso ?? "");
  return Number.isNaN(d.getTime()) ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type Cell = { key: string; day: number; other: boolean };

// Monday-first month grid including the greyed days of the neighbouring months.
export function monthCells(y: number, m: number): Cell[] {
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const prev = new Date(y, m, 0).getDate();
  const cells: Cell[] = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ key: keyOf(m === 0 ? y - 1 : y, (m + 11) % 12, prev - i), day: prev - i, other: true });
  for (let d = 1; d <= total; d++) cells.push({ key: keyOf(y, m, d), day: d, other: false });
  for (let d = 1; cells.length % 7 !== 0; d++) cells.push({ key: keyOf(m === 11 ? y + 1 : y, (m + 1) % 12, d), day: d, other: true });
  return cells;
}

export const todayKey = (): string => dayKey(new Date().toISOString());
