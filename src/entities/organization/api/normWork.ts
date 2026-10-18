import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { OrgMember, WorkItem, WorkKind } from "../model/workTypes";

export function normMember(v: unknown): OrgMember {
  const d = asDict(v);
  const m = asDict(d.membership);
  const u = asDict(d.user);
  const w = asDict(d.workload);
  const name = asStr(u.name).trim() || [asStr(u.first_name), asStr(u.last_name)].filter(Boolean).join(" ");
  return {
    userId: asStr(u.id ?? m.user_id),
    name,
    phone: asStr(u.phone),
    lexgoId: asStr(u.lexgo_id),
    title: asStr(m.title).trim(),
    status: asStr(m.status, "active"),
    sellerType: asStr(d.seller_type ?? u.role),
    region: asStr(d.region).trim(),
    specializations: asArr(d.specializations).map((x) => asStr(x)).filter(Boolean),
    verification: asStr(d.verification_status),
    rating: asNum(d.rating),
    reviews: asNum(d.reviews_count),
    workload: { orders: asNum(w.active_orders), cases: asNum(w.active_cases), urgent: asNum(w.urgent_requests) },
  };
}

function kindOf(d: Record<string, unknown>, fallback: WorkKind): WorkKind {
  const k = asStr(d.kind ?? d.record_type ?? d.module ?? d.type).toLowerCase();
  if (k.includes("urgent")) return "urgent";
  if (k.includes("case") || d.case_number) return "case";
  return k.includes("order") ? "order" : fallback;
}

// An order, case or urgent request. Orders carry service_title + details.title; cases a plain title.
export function normWork(v: unknown, fallback: WorkKind = "order"): WorkItem {
  const d = asDict(v);
  const details = asDict(d.details);
  const primary = asStr(d.title ?? d.service_title ?? details.title ?? d.service_type).trim();
  const second = asStr(details.title).trim();
  const client = asDict(d.client);
  return {
    id: asStr(d.id ?? d.order_id ?? d.case_id ?? d.request_id),
    workId: asStr(d.work_id ?? d.public_id ?? d.case_number),
    kind: kindOf(d, fallback),
    title: primary,
    subtitle: second && second !== primary ? second : "",
    status: asStr(d.status).toLowerCase(),
    stage: asStr(d.stage).toLowerCase(),
    paymentStatus: asStr(d.payment_status).toLowerCase(),
    memberUserId: asStr(d.lawyer_user_id ?? d.member_user_id ?? d.seller_user_id ?? d.assigned_lawyer_user_id ?? d.assignee_user_id),
    clientName: asStr(d.client_name ?? client.name).trim(),
    amount: uzs(d, "price", "amount", "total_amount"),
    deadlineAt: asStr(d.deadline_at ?? d.due_at),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at ?? d.created_at),
  };
}
