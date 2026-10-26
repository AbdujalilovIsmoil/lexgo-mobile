import { getPolicies } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import type { ServiceCategory } from "../model/types";

type Override = { hidden?: boolean; title?: string };

// Categories the admin hid or renamed live in the public `order` policy
// (GET /platform/policies → order.catalog.categories[id]); the web applies the same overlay.
async function overrides(): Promise<Record<string, Override>> {
  try {
    const order = asDict((await getPolicies()).order);
    return asDict(asDict(order.catalog).categories) as Record<string, Override>;
  } catch {
    return {};
  }
}

export async function applyOverlay(rows: ServiceCategory[]): Promise<ServiceCategory[]> {
  const ov = await overrides();
  return rows
    .map((c) => ({ ...c, name: asDict(ov[c.id]).title ? String(asDict(ov[c.id]).title) : c.name }))
    .filter((c) => c.name && asDict(ov[c.id]).hidden !== true);
}
