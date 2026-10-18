import type { ManagedService } from "../model/serviceTypes";

// Why a service does not show in the marketplace (og5.reasons.*); empty when it does.
export function hiddenReasons(i: ManagedService, verified: boolean): string[] {
  if (i.visible) return [];
  const out: string[] = [];
  if (!i.catalogActive) out.push("catalogOff");
  if (i.status === "paused") out.push("paused");
  if (i.status === "inactive") out.push("inactive");
  if (!i.effectivePrice) out.push("noPrice");
  if (!verified) out.push("unverified");
  return out.length ? out : ["other"];
}
