import { http } from "@/shared/api";
import { asDict, asNum } from "@/shared/lib/json";
import { listOf, strings } from "../lib/norm";
import { normConstructor } from "../lib/normConstructor";
import { flatItems, normGroups } from "../lib/normGroups";
import { enc } from "../lib/qs";
import type { StudioConstructor } from "../model/types";
import type { StudioGroup } from "../model/typesNav";

export type Registry = { items: StudioConstructor[]; groups: StudioGroup[]; userRoles: string[] };

// GET /studio/constructors — the ordered groups (each with its constructors, in sequence order) and the caller's studio roles.
export async function listConstructors(): Promise<Registry> {
  const raw = await http("/studio/constructors");
  const d = asDict(raw);
  const groups = normGroups(raw);
  return { items: flatItems(raw, groups).filter((c) => c.code), groups, userRoles: strings(d.user_roles ?? d.roles).map((r) => r.toLowerCase()) };
}

// GET /studio/constructors/{code} — the same constructor with its full field schema.
export async function getConstructor(code: string): Promise<StudioConstructor> {
  return normConstructor(await http(`/studio/constructors/${enc(code)}`));
}

// POST /admin/studio/constructors/sync (admin) — returns how many constructors the server reports.
export async function syncConstructors(): Promise<number> {
  const res = await http("/admin/studio/constructors/sync", { method: "POST" });
  const d = asDict(res);
  return asNum(d.count ?? d.synced ?? d.total, listOf(res, ["items", "constructors"]).length);
}
