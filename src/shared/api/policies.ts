import { asDict, type Dict } from "@/shared/lib/json";
import { http } from "./http";

const TTL_MS = 10 * 60_000;
let cached: { at: number; sections: Promise<Dict> } | null = null;

// GET /platform/policies (public) — the settings admins change on the web: the catalogue overlay, plan overrides, the pricing corridor,
// upload limits. One answer serves every reader for 10 minutes (five modules used to fetch it on their own); a failed read is not kept.
// Resolves to its sections (`items`).
export function getPolicies(): Promise<Dict> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.sections;
  const sections = http("/platform/policies", { auth: false }).then((d) => {
    const o = asDict(d);
    return asDict(o.items ?? o.sections ?? o);
  });
  const entry = { at: Date.now(), sections };
  cached = entry;
  sections.catch(() => {
    if (cached === entry) cached = null;
  });
  return sections;
}
