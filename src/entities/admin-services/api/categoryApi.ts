import { ApiError, http } from "@/shared/api";
import { isMissingRoute } from "../lib/missingRoute";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { Category, OverlaidCategory } from "../model/types";
import { dropOverride, getCategoryOverrides, writeOverride } from "./overlayApi";

export type Via = "backend" | "overlay";

// GET /admin/service-categories (every category incl. empty and inactive ones; the web's public
// GET /service-categories is the fallback) merged with the overlay (hidden / renamed).
async function fetchCategories(): Promise<unknown> {
  try {
    return await http("/admin/service-categories");
  } catch (e) {
    if (!isMissingRoute(e) && !(e instanceof ApiError && e.status === 403)) throw e;
    return http("/service-categories");
  }
}

export async function listCategories(): Promise<OverlaidCategory[]> {
  const [data, ov] = await Promise.all([fetchCategories(), getCategoryOverrides()]);
  return listFrom(data, "categories", "items", "data").map((v): OverlaidCategory => {
    const d = asDict(v);
    const base: Category = { id: asStr(d.id), name: asStr(d.title ?? d.name), slug: asStr(d.slug), description: asStr(d.description), servicesCount: asNum(d.services_count), isActive: d.is_active !== false };
    const o = ov[base.id];
    return { ...base, name: o?.title || base.name, hidden: !!o?.hidden, overridden: !!o?.title };
  });
}

// POST /admin/service-categories.
export async function createCategory(b: { slug: string; title: string; description: string }): Promise<void> {
  await http("/admin/service-categories", { method: "POST", body: b });
}

// PATCH /admin/service-categories/{id}; falls back to the overlay when the route is missing.
export async function saveCategory(id: string, title: string): Promise<Via> {
  try {
    await http(`/admin/service-categories/${encodeURIComponent(id)}`, { method: "PATCH", body: { title } });
    return "backend";
  } catch (e) {
    if (!isMissingRoute(e)) throw e;
  }
  await writeOverride(id, { title });
  return "overlay";
}

// DELETE /admin/service-categories/{id} (405 on the live backend) → hide through the overlay.
export async function removeCategory(id: string): Promise<Via> {
  try {
    await http(`/admin/service-categories/${encodeURIComponent(id)}`, { method: "DELETE" });
    return "backend";
  } catch (e) {
    if (!isMissingRoute(e)) throw e;
  }
  await writeOverride(id, { hidden: true });
  return "overlay";
}

export const restoreCategory = (id: string) => writeOverride(id, { hidden: false });
export const resetCategory = (id: string) => dropOverride(id);
