import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { InstructorContract } from "../model/types";
import { pick } from "./normCommand";

const strings = (v: unknown): string[] => asArr(v).map((x) => pick(x, asDict(x).route, asDict(x).path, asDict(x).name)).filter(Boolean);

function stringMap(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(asDict(v))) if (typeof val === "string" && val) out[k] = val;
  return out;
}

// GET /ai/instructor/contract (v2.1): command types, mutating actions, route allowlist and alias maps.
export function normContract(raw: unknown): InstructorContract | null {
  const d = asDict(raw);
  const commandTypes = strings(d.command_types ?? d.commands);
  if (!commandTypes.length && !pick(d.contract_version)) return null;
  return {
    version: pick(d.contract_version, d.version) || "2",
    commandTypes,
    mutatingActions: strings(d.mutating_actions),
    allowedRoutes: strings(d.allowed_routes ?? d.routes).filter((r) => r.startsWith("/") && !r.startsWith("//")),
    routeAliases: stringMap(d.route_aliases),
    targetAliases: stringMap(d.target_aliases),
    role: pick(d.role, d.user_role),
    targetsLimit: asNum(d.accepted_targets_limit, 120),
  };
}
