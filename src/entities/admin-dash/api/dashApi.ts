import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { AdminDash, DashFilter, DashListItem, DrillMetric, Point } from "../model/types";
import { dashQuery } from "./dashQuery";

export function normListItem(v: unknown): DashListItem {
  const d = asDict(v);
  const p = asDict(d.payload);
  const amount = uzs(d, "value", "amount", "price");
  return {
    id: asStr(d.id),
    title: asStr(d.title ?? d.name ?? d.subject ?? d.lawyer_name ?? d.comment ?? d.work_id ?? d.case_number),
    status: asStr(d.status ?? d.stage),
    meta: asStr(d.industry ?? d.contact ?? p.industry ?? d.gift_code ?? d.rating ?? d.assignee_name ?? d.role ?? d.provider),
    amount: amount || undefined,
    date: asStr(d.updated_at ?? d.created_at),
  };
}

// Numeric entries of one counter group (the backend also sends *_tiyin twins; skipped).
function counters(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, x] of Object.entries(asDict(v))) if (!k.endsWith("_tiyin") && (typeof x === "number" || typeof x === "string")) out[k] = asNum(x);
  return out;
}

// GET /admin/dashboard — counters of every group merged (first group wins on a clash).
export async function getAdminDash(f?: DashFilter): Promise<AdminDash> {
  const d = asDict(await http(`/admin/dashboard${dashQuery(f)}`));
  const lists = asDict(d.lists);
  const charts: Record<string, Point[]> = {};
  for (const [key, val] of Object.entries(asDict(d.charts))) {
    charts[key] = asArr(val).map((p) => {
      const x = asDict(p);
      return { label: asStr(x.label ?? x.date ?? x.day ?? x.name ?? x.key), value: asNum(x.value ?? x.count ?? x.total ?? x.amount) };
    });
  }
  return {
    stats: { ...counters(d.sellers), ...counters(d.leads), ...counters(d.orders), ...counters(d.payments), ...counters(d.totals) },
    charts,
    lists: {
      tasks: asArr(lists.tasks).map(normListItem),
      b2bClients: asArr(lists.b2b_clients).map(normListItem),
      reviews: asArr(lists.reviews).map(normListItem),
      gifts: asArr(lists.gifts).map(normListItem),
    },
  };
}

// GET /admin/dashboard/drilldown — the real records behind a metric.
export async function getDrilldown(metric: DrillMetric, f?: DashFilter, limit = 50): Promise<DashListItem[]> {
  const raw = await http(`/admin/dashboard/drilldown${dashQuery(f, { metric, limit: String(limit) })}`);
  const d = asDict(raw);
  return asArr(Array.isArray(raw) ? raw : d.items ?? d.data ?? d.results ?? d.records).map(normListItem);
}

// POST /admin/demo-data/seed (staging only) → how many stray test records were removed.
export async function seedDemoData(): Promise<number> {
  const d = asDict(await http("/admin/demo-data/seed", { method: "POST" }));
  const rm = d.removed ?? d.deleted ?? d.cleaned ?? d.removed_records ?? asDict(d.counts ?? d.summary ?? d.seeded).removed;
  if (Array.isArray(rm)) return rm.length;
  if (rm && typeof rm === "object") return Object.values(rm).reduce<number>((s, x) => s + (Array.isArray(x) ? x.length : asNum(x)), 0);
  return Math.max(0, Math.round(asNum(rm)));
}
