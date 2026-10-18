import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom, type Dict } from "@/shared/lib/json";
import { readinessOk } from "../model/readiness";
import type { HistoryEntry, PolicySection, Readiness, UnverifiedMode } from "../model/types";

// GET /admin/platform/policies — {items: {order, payment, …, marketplace_pricing}}. Returns every section's raw dict.
export async function getPolicies(): Promise<Record<string, Dict>> {
  const d = asDict(await http("/admin/platform/policies"));
  return Object.fromEntries(Object.entries(asDict(d.items ?? d.sections ?? d)).map(([k, v]) => [k, asDict(v)]));
}

// PUT /admin/platform/policies/{section} — replaces the section and creates a new version.
export async function putPolicy(section: PolicySection, data: Dict): Promise<void> {
  await http(`/admin/platform/policies/${section}`, { method: "PUT", body: data });
}

// GET /admin/platform/policies/{section}/history — one record per version, payload {version, previous, current}.
export async function getHistory(section: PolicySection): Promise<HistoryEntry[]> {
  return listFrom(await http(`/admin/platform/policies/${section}/history`), "items", "history", "data", "versions").map((x, i) => {
    const d = asDict(x);
    const p = asDict(d.payload);
    const dict = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : null);
    return { id: asStr(d.id, String(i)), version: asStr(d.version ?? p.version), changedBy: asStr(d.changed_by ?? d.updated_by ?? d.user_id ?? d.owner_user_id), at: asStr(d.created_at ?? d.updated_at), previous: dict(p.previous), current: dict(p.current) };
  });
}

// GET /admin/compliance/readiness — production readiness checklist (a list, or a {key: status} map like the web reads it).
export async function getReadiness(): Promise<Readiness> {
  const d = asDict(await http("/admin/compliance/readiness"));
  const row = (key: string, r: Dict, v?: unknown) => ({ key, title: asStr(r.title ?? r.label ?? r.name ?? key), status: asStr(r.status ?? (r.ok === true || v === true ? "ok" : r.ok === false || v === false ? "missing" : typeof v === "string" ? v : "")).toLowerCase(), note: asStr(r.note ?? r.detail ?? r.message ?? r.hint) });
  const list = listFrom(d, "items", "checks", "checklist", "results").map((x) => { const r = asDict(x); return row(asStr(r.key ?? r.id ?? r.code ?? r.name), r); });
  const items = list.length ? list : Object.entries(asDict(d.checks ?? d.items)).map(([k, v]) => row(k, asDict(v), v));
  return { status: asStr(d.status ?? d.overall_status), passed: asNum(d.passed, items.filter((i) => readinessOk(i.status)).length), total: asNum(d.total, items.length), items, raw: d };
}

// The unverified-sellers switch lives under the public order policy: order.catalog.unverified_sellers.
export async function getUnverifiedMode(): Promise<UnverifiedMode> {
  const order = asDict(asDict(asDict(await http("/platform/policies")).items).order);
  return asStr(asDict(order.catalog).unverified_sellers) === "hidden" ? "hidden" : "badge";
}

export async function setUnverifiedMode(mode: UnverifiedMode): Promise<void> {
  const order = (await getPolicies()).order ?? {};
  await putPolicy("order", { ...order, catalog: { ...asDict(order.catalog), unverified_sellers: mode } });
}
