import { http } from "@/shared/api";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import { isActiveStatus, needsAction } from "../lib/status";
import type { ReqItem } from "../model/types";

// GET /urgent-advokat/requests/assigned — Tezkor requests this professional takes part in.
export async function listUrgent(): Promise<ReqItem[]> {
  return listFrom(await http("/urgent-advokat/requests/assigned"), "items", "data", "requests").map((v) => {
    const d = asDict(v);
    const p = asDict(d.payload);
    const status = asStr(d.status).toLowerCase();
    const lc = asDict(d.lifecycle);
    const final = Array.isArray(lc.final_statuses) ? lc.final_statuses.map((x) => asStr(x)) : [];
    return {
      kind: "urgent" as const, id: asStr(d.id), title: asStr(d.title) || asStr(p.need), client: asStr(asDict(d.client).name),
      detail: asStr(p.channel), amount: 0, when: asStr(p.scheduled_at), status, at: asStr(d.updated_at ?? d.created_at),
      route: `/pro/urgent/${asStr(d.id)}`, action: needsAction("urgent", status), active: final.length ? !final.includes(status) : isActiveStatus("urgent", status),
    };
  });
}

// GET /marketplace/me/orders?role_view=seller — marketplace orders bought from this professional.
export async function listOrders(): Promise<ReqItem[]> {
  const items = listFrom(await http("/marketplace/me/orders?role_view=seller"), "items", "data", "orders");
  return items.map((v) => {
    const d = asDict(v);
    const status = asStr(d.status).toLowerCase();
    return {
      kind: "orders" as const, id: asStr(d.id ?? d.order_id), title: asStr(d.service_title) || asStr(asDict(d.details).service_title), client: asStr(asDict(d.client).name),
      detail: "", amount: uzs(d, "price"), when: "", status, at: asStr(d.updated_at ?? d.created_at), route: `/pro/orders/${asStr(d.id ?? d.order_id)}`,
      action: needsAction("orders", status), active: isActiveStatus("orders", status),
    };
  });
}

// GET /calls/invited — meetings / calls the user was invited to (active ones can be joined).
export async function listMeetings(): Promise<ReqItem[]> {
  return listFrom(await http("/calls/invited"), "items", "data", "calls").map((v) => {
    const d = asDict(v);
    const status = asStr(d.call_status ?? d.status).toLowerCase();
    const live = status === "active";
    return {
      kind: "meetings" as const, id: asStr(d.call_id ?? d.id), title: asStr(d.title), client: asStr(d.caller_name),
      detail: asStr(d.call_type), amount: 0, when: "", status, at: asStr(d.started_at),
      route: live ? `/call/${asStr(d.room_id)}` : "/meetings", action: needsAction("meetings", status), active: isActiveStatus("meetings", status),
    };
  });
}
