import type { DashFilter } from "../model/types";

// `?region=…&date_from=…&date_to=…` — empty when no filter is set.
export function dashQuery(f?: DashFilter, extra: Record<string, string> = {}): string {
  const p: [string, string][] = [...Object.entries(extra)];
  if (f?.region) p.push(["region", f.region]);
  if (f?.from) p.push(["date_from", f.from]);
  if (f?.to) p.push(["date_to", f.to]);
  return p.length ? `?${p.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}` : "";
}
