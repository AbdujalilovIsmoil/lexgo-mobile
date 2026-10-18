import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { first, listOf } from "../lib/norm";
import { enc } from "../lib/qs";
import type { ReleaseInput, ReleaseItem, RuntimeRow, StudioRelease } from "../model/typesRelease";

const item = (v: unknown): ReleaseItem => {
  const d = asDict(v);
  return { objectId: asStr(d.object_id), code: asStr(d.constructor_code), version: asStr(d.version), status: asStr(d.status), ok: d.ok !== false, errors: asArr(d.errors).map((e) => first(asDict(e).message, e)).filter(Boolean) };
};

function norm(v: unknown): StudioRelease {
  const d = asDict(v);
  const val = asDict(d.validation);
  return {
    id: asStr(d.id), title: asStr(d.title), description: asStr(d.description), environment: asStr(d.environment, "production"), status: asStr(d.status),
    ok: typeof val.ok === "boolean" ? val.ok : null, items: asArr(val.items).map(item), objectCount: asArr(d.object_ids).length, createdAt: asStr(d.created_at), publishedAt: asStr(d.published_at),
  };
}

// GET /admin/studio/releases
export const listReleases = async () => listOf(await http("/admin/studio/releases"), ["items"]).map(norm).filter((r) => r.id);

// POST /admin/studio/releases — bundles approved / published objects (title ≥ 2 chars, environment staging | production).
export const createRelease = async (i: ReleaseInput) => norm(await http("/admin/studio/releases", { method: "POST", body: { title: i.title, description: i.description, environment: i.environment, object_ids: i.objectIds } }));
// POST …/{id}/validate re-checks every object of the bundle; …/publish releases it to its environment.
export const validateRelease = async (id: string) => norm(await http(`/admin/studio/releases/${enc(id)}/validate`, { method: "POST" }));
export const publishRelease = async (id: string) => norm(await http(`/admin/studio/releases/${enc(id)}/publish`, { method: "POST" }));

// GET /admin/studio/runtime — what is live now.
export const listRuntime = async (): Promise<RuntimeRow[]> =>
  listOf(await http("/admin/studio/runtime"), ["items"]).map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), code: first(d.constructor_code, d.code), title: first(d.title, d.name, d.object_title), target: first(d.runtime_target, d.target), version: first(d.version, d.version_label), status: asStr(d.status), publishedAt: first(d.published_at, d.updated_at) };
  });
