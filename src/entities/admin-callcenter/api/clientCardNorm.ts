import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { ClientCard } from "../model/clientTypes";
import { normClient } from "./clientNorm";

const rows = <T>(v: unknown, f: (d: Record<string, unknown>) => T): T[] => asArr(v).map((x) => f(asDict(x)));
const at = (d: Record<string, unknown>) => asStr(d.created_at);

// The 360 payload of a client → ClientCard (every list tolerant of missing keys).
export function normClientCard(raw: unknown): ClientCard {
  const d = asDict(raw);
  const c = asDict(d.client);
  const s = asDict(d.summary);
  const subs = rows(d.subscriptions, (x) => ({ id: asStr(x.id), planId: asStr(x.plan_id), status: asStr(x.status), startsAt: asStr(x.starts_at), endsAt: asStr(x.ends_at) }));
  return {
    client: { ...normClient(c), referralCode: asStr(c.referral_code), createdAt: asStr(c.created_at) },
    summary: {
      orders: asNum(s.orders_count), spent: uzs(s, "total_spent"), leads: asNum(s.leads_count), rooms: asNum(s.rooms_count), complaints: asNum(s.complaints_count),
      payments: asNum(s.payments_count), cases: asNum(s.cases_count), subscriptions: subs.filter((x) => x.status === "active").length,
    },
    orders: rows(d.orders, (o) => {
      const svc = asDict(o.service);
      const det = asDict(o.details);
      return {
        id: asStr(o.id), workId: asStr(o.work_id), status: asStr(o.status), createdAt: at(o),
        title: asStr(svc.name ?? svc.title ?? o.service_title ?? o.service_name ?? det.service_title ?? o.title ?? det.title),
        lawyerName: asStr(o.lawyer_name ?? asDict(o.lawyer).name),
      };
    }),
    cases: rows(d.cases, (x) => ({ id: asStr(x.id), workId: asStr(x.work_id ?? x.case_number), title: asStr(x.title), stage: asStr(x.stage), status: asStr(x.status), createdAt: at(x) })),
    payments: rows(d.payments, (p) => ({ id: asStr(p.id), amount: uzs(p, "amount"), status: asStr(p.status), kind: asStr(p.kind ?? p.target_type), description: asStr(p.description), createdAt: at(p) })),
    leads: rows(d.leads, (l) => ({ id: asStr(l.id), category: asStr(l.category), source: asStr(l.source), region: asStr(l.region), status: asStr(l.status), createdAt: at(l) })),
    activities: rows(d.activities, (a) => ({ id: asStr(a.id), action: asStr(a.action), detail: asStr(a.detail), createdAt: at(a) })),
    subs,
    complaints: rows(d.complaints, (x) => ({ id: asStr(x.id), workId: asStr(x.work_id), title: asStr(x.title), status: asStr(x.status), createdAt: at(x) })),
    family: rows(d.family_members, (x) => ({ id: asStr(x.id), name: asStr(x.title ?? x.name), phone: asStr(asDict(x.payload).phone ?? x.phone), relation: asStr(asDict(x.payload).relation ?? x.relation) })),
  };
}
