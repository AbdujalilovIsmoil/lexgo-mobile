import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { Integration, IntegrationsOverview } from "../model/types";
import { normResidency } from "./residency";

function normIntegration(x: unknown): Integration {
  const d = asDict(x);
  return {
    key: asStr(d.key ?? d.name),
    label: asStr(d.label),
    category: asStr(d.category),
    status: asStr(d.status),
    healthy: Boolean(d.healthy),
    configured: Boolean(d.configured),
    requiresSuperadmin: Boolean(d.requires_superadmin),
  };
}

// GET /integrations/status — a plain list of tiles (never secrets), sometimes wrapped; data
// residency may sit beside the list or as one of its rows (then it is kept out of the tiles).
export async function getIntegrations(): Promise<IntegrationsOverview> {
  const data = await http("/integrations/status");
  const rows = listFrom(data, "items", "data", "integrations", "providers");
  const isRes = (x: unknown) => asStr(asDict(x).key ?? asDict(x).name) === "data_residency" || asStr(asDict(x).category) === "data_residency";
  const d = asDict(data);
  const raw = d.data_residency ?? d.dataResidency ?? asDict(d.meta).data_residency ?? asDict(d.infrastructure).data_residency ?? rows.find(isRes);
  return { items: rows.filter((r) => !isRes(r)).map(normIntegration), residency: normResidency(raw) };
}
