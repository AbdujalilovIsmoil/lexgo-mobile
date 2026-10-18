import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs, type Dict } from "@/shared/lib/json";
import type { ClientDetail, ConflictInput, ConflictResult, Linked, ManualClient, ProClient } from "../model/types";

// GET /lawyers/me/clients — derived server-side from this professional's cases, orders and documents.
export async function listClients(): Promise<ProClient[]> {
  return listFrom(await http("/lawyers/me/clients"), "items", "data", "clients").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id), name: asStr(d.name), phone: asStr(d.phone), casesCount: asNum(d.cases_count), ordersCount: asNum(d.orders_count),
      activeCaseIds: asArr(d.active_case_ids).map((x) => asStr(x)), hasConflict: Boolean(d.has_conflict), lastActiveAt: asStr(d.last_active_at),
    };
  });
}

const link = (d: Dict, title: string, sub: string[]): Linked => ({ id: asStr(d.id), title: title || "—", sub: sub.filter(Boolean).join(" · "), status: asStr(d.status).toLowerCase(), at: asStr(d.updated_at ?? d.created_at) });

// GET /lawyers/me/clients/{id} — everything shared with one client; 404 when they never worked together.
export async function clientDetail(id: string): Promise<ClientDetail> {
  const d = asDict(await http(`/lawyers/me/clients/${encodeURIComponent(id)}`));
  const c = asDict(d.client);
  const each = (k: string) => asArr(d[k]).map(asDict);
  return {
    manual: asStr(d.type) === "manual", id: asStr(c.id, id), name: asStr(c.name), phone: asStr(c.phone), region: asStr(c.region), company: asStr(c.company), notes: asStr(c.notes), createdAt: asStr(c.created_at),
    cases: each("cases").map((x) => link(x, asStr(x.title ?? x.case_type), [asStr(x.case_number ?? x.work_id), asStr(x.stage)])),
    orders: each("orders").map((x) => link(x, asStr(x.title ?? asDict(x.service).name ?? x.service_title), [asStr(x.work_id), uzs(x, "price", "amount") ? String(uzs(x, "price", "amount")) : ""])),
    payments: each("payments").map((x) => link(x, String(uzs(x, "amount")), [asStr(x.method ?? x.provider), asStr(x.description)])),
    documents: each("documents").map((x) => link(x, asStr(x.title ?? x.document_type), [asStr(x.work_id)])),
    timeline: each("timeline").map((x) => ({ ...link(x, asStr(x.title), []), type: asStr(x.type) })),
    chats: each("chats").map((x) => ({ id: asStr(x.id), status: asStr(x.status), caseId: asStr(x.case_id), orderId: asStr(x.order_id) })),
  };
}

export async function createClient(c: ManualClient): Promise<void> {
  await http("/lawyers/me/clients", { method: "POST", body: { ...c, phone: c.phone || undefined, pinfl: c.pinfl || undefined, company: c.company || undefined, notes: c.notes || undefined } });
}

// POST /conflicts/check — matches against own clients, cases, opponents and representatives.
export async function checkConflict(i: ConflictInput): Promise<ConflictResult> {
  const d = asDict(await http("/conflicts/check", { method: "POST", body: { phone: i.phone || undefined, pinfl: i.pinfl || undefined, opponent: i.opponent || undefined, representatives: i.representatives } }));
  return { clear: asStr(d.status) !== "potential_conflict", matches: asArr(d.matches).map((m) => ({ title: asStr(asDict(m).title ?? asDict(m).case_number), reason: asStr(asDict(m).reason) })) };
}

// POST /secure-chats — opens a private room with a LexGo client (used only when none exists yet).
export async function startChat(clientId: string, sellerId: string): Promise<string> {
  return asStr(asDict(await http("/secure-chats", { method: "POST", body: { client_user_id: clientId, seller_user_id: sellerId } })).id);
}
