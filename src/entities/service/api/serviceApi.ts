import { http, isNetworkError } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import { readJson, writeJson } from "@/shared/lib/storage";
import { applyOverlay } from "./categoryOverlay";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import { normCategory, normService } from "./normalize";
import type { Service, ServiceCategory } from "../model/types";

const SNAPSHOT = "lexgo_service_categories";

// The category summary is the catalogue's front door: the last good answer is
// kept on the device and served when the network is down (offline-friendly).
export async function listCategories(): Promise<ServiceCategory[]> {
  try {
    const data = await http("/service-categories");
    const given = listFrom(data, "categories", "items", "data").map(normCategory);
    const rows = await applyOverlay(given.length ? given : await categoriesFromServices());
    if (rows.length) void writeJson(SNAPSHOT, rows);
    return rows;
  } catch (e) {
    const saved = isNetworkError(e) ? await readJson<ServiceCategory[]>(SNAPSHOT) : null;
    if (saved?.length) return saved;
    throw e;
  }
}

// When the summary endpoint has nothing (a catalogue without published categories) the services themselves still
// exist: group them by their own category and subcategory so the catalogue is never an empty screen.
export async function categoriesFromServices(): Promise<ServiceCategory[]> {
  const rows = listFrom(await http("/services?limit=200&catalog_only=true"), "services", "items", "data").map((v) => asDict(v));
  const map = new Map<string, ServiceCategory & { subs: Map<string, { servicesCount: number; samples: string[] }> }>();
  for (const d of rows) {
    const id = asStr(d.category_id);
    const title = cleanDocTitle(asStr(d.title ?? d.name));
    if (!id || !title) continue;
    const cat = map.get(id) ?? { id, name: asStr(d.category_title) || "—", slug: "", description: "", servicesCount: 0, subcategoriesCount: 0, subcategories: [], subs: new Map() };
    cat.servicesCount += 1;
    const sub = asStr(d.subcategory).trim();
    if (sub) {
      const e = cat.subs.get(sub) ?? { servicesCount: 0, samples: [] };
      e.servicesCount += 1;
      if (e.samples.length < 3) e.samples.push(title);
      cat.subs.set(sub, e);
    }
    map.set(id, cat);
  }
  return [...map.values()].map(({ subs, ...c }) => ({ ...c, subcategories: [...subs].map(([t, e]) => ({ title: t, ...e })), subcategoriesCount: subs.size })).sort((a, b) => b.servicesCount - a.servicesCount);
}

export type ServiceQuery = { categoryId?: string; sub?: string; q?: string; limit?: number; offset?: number; catalogOnly?: boolean };

// GET /services is paged by limit/offset; `subcategory` and `q` are server-side filters.
export async function listServices(f: ServiceQuery = {}, locale = "uz"): Promise<Service[]> {
  const qs = new URLSearchParams();
  if (f.categoryId) qs.set("category_id", f.categoryId);
  if (f.q) qs.set("q", f.q.slice(0, 120));
  if (f.sub) qs.set("subcategory", f.sub);
  if (f.catalogOnly != null) qs.set("catalog_only", String(f.catalogOnly));
  qs.set("limit", String(f.limit ?? 50));
  if (f.offset) qs.set("offset", String(f.offset));
  const data = await http(`/services?${qs}`);
  return listFrom(data, "services", "items", "data").map((v) => normService(v, locale)).filter((s) => s.name);
}

// GET /services/search — the backend folds Latin/Cyrillic spellings; q is capped at 120 chars.
export async function searchServices(q: string, locale = "uz"): Promise<Service[]> {
  const t = q.trim().slice(0, 120);
  if (!t) return [];
  const data = await http(`/services/search?${new URLSearchParams({ q: t, limit: "30" })}`);
  return listFrom(data, "results", "items", "services", "data").map((v) => {
    const d = v as Record<string, unknown>;
    return normService(d.service ?? d, locale);
  });
}
