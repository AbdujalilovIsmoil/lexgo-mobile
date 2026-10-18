import type { PendingPromo, Running } from "../model/types";

const SKEW = 5 * 60_000; // phone and server clocks may differ a little

/**
 * Has the request that waited for the admin's answer turned into a running promotion? Same placement (and service for a
 * service boost), and one that started after the request was made — an older one is just what the seller already had.
 */
export function isRunning(p: Pick<PendingPromo, "target" | "at">, running: Pick<Running, "placement" | "serviceId" | "startsAt">[]): boolean {
  const fresh = (r: Pick<Running, "startsAt">) => { const t = Date.parse(r.startsAt); return !Number.isFinite(t) || t >= p.at - SKEW; };
  if (p.target.startsWith("service:")) return running.some((r) => r.placement === "service_boost" && r.serviceId === p.target.slice(8) && fresh(r));
  return running.some((r) => r.placement === p.target && fresh(r));
}
