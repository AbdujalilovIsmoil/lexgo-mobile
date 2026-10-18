import { scrubProps } from "./scrub";

// The last few things that happened, attached to a crash report by whoever wires a reporter.
// Strings are limited to the same token shape as analytics props, so no user text gets in.
export type Crumb = { t: number; name: string; data?: Record<string, string | number | boolean> };
const MAX = 40;
const ring: Crumb[] = [];

export function crumb(name: string, data?: Record<string, unknown>): void {
  const entry: Crumb = { t: Date.now(), name: name.replace(/[^A-Za-z0-9_.:/\-[\]]/g, "").slice(0, 48) };
  const d = scrubProps(data);
  if (Object.keys(d).length) entry.data = d;
  ring.push(entry);
  if (ring.length > MAX) ring.shift();
}

export const getBreadcrumbs = (): readonly Crumb[] => ring;
export const clearBreadcrumbs = (): void => void (ring.length = 0);
