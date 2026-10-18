// Server times: naive strings are UTC, microseconds are trimmed so Hermes parses them.
export function serverIso(v: string): string {
  let s = (v || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}[ T]\d/.test(s)) {
    s = s.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");
    if (!/([zZ]|[+-]\d{2}:?\d{2})$/.test(s)) s += "Z";
  }
  return s;
}

export function serverMs(v: string): number {
  const n = Date.parse(serverIso(v));
  return Number.isFinite(n) ? n : 0;
}

const key = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;

/** "today" / "yesterday" for a server time in the device's time zone, else "". */
export function relativeDay(iso: string): "today" | "yesterday" | "" {
  const d = new Date(serverMs(iso));
  const now = new Date();
  if (key(d) === key(now)) return "today";
  return key(d) === key(new Date(now.getTime() - 86_400_000)) ? "yesterday" : "";
}

/** Local calendar day of a server time (groups messages under day headings). */
export const localDay = (iso: string): string => key(new Date(serverMs(iso)));
