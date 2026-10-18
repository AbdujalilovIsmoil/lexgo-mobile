import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { C360Row, Client360 } from "../model/typesAdmin";
import { normUserDetail } from "./userAdminApi";

const row = (title: (d: Record<string, unknown>) => string, subtitle: (d: Record<string, unknown>) => string) => (v: unknown): C360Row => {
  const d = asDict(v);
  return { id: asStr(d.id), title: title(d) || asStr(d.work_id), subtitle: subtitle(d), status: asStr(d.status ?? d.payment_status), amount: uzs(d, "price", "amount", "paid_amount"), date: asStr(d.created_at ?? d.updated_at) };
};
const first = (d: Record<string, unknown>, ...k: string[]) => k.map((x) => asStr(d[x])).find(Boolean) ?? "";
const rows = (v: unknown, f: ReturnType<typeof row>) => asArr(v).map(f).filter((r) => r.id);

// GET /admin/clients/{id}/360 → typed sections (money fields are whole so'm).
export function norm360(v: unknown): Client360 {
  const d = asDict(v);
  const s = asDict(d.summary);
  const generic = row((x) => first(x, "title", "work_id"), (x) => first(x, "category", "source", "provider"));
  return {
    client: normUserDetail(d.client),
    summary: { orders: asNum(s.orders_count), cases: asNum(s.cases_count), payments: asNum(s.payments_count), spent: asNum(s.total_spent), leads: asNum(s.leads_count), rooms: asNum(s.rooms_count), complaints: asNum(s.complaints_count), reviews: asNum(s.reviews_count) },
    orders: rows(d.orders, row((x) => first(x, "service_title") || first(asDict(x.details), "service_title"), (x) => first(x, "lawyer_name") || first(asDict(x.details), "lawyer_name"))),
    cases: rows(d.cases, generic),
    payments: rows(d.payments, row((x) => first(x, "work_id", "target_type"), (x) => first(x, "provider"))),
    leads: rows(d.leads, row((x) => first(x, "work_id"), (x) => first(x, "category", "source"))),
    complaints: rows(d.complaints, generic), reviews: rows(d.reviews, row((x) => first(x, "comment"), (x) => first(x, "lawyer_name"))),
    subscriptions: rows(d.subscriptions, generic),
    activities: rows(d.activities, row((x) => first(x, "action"), () => "")),
    rooms: asNum(s.rooms_count),
  };
}
