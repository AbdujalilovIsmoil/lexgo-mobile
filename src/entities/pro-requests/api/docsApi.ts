import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import { isActiveStatus, needsAction } from "../lib/status";
import type { ReqItem, ReqKind } from "../model/types";

function norm(kind: ReqKind, v: unknown): ReqItem {
  const d = asDict(v);
  const status = asStr(d.status).toLowerCase();
  const id = asStr(d.id);
  return {
    kind,
    id,
    title: asStr(d.title) || asStr(d.need) || asStr(asDict(d.service).title),
    client: asStr(asDict(d.client).name),
    detail: asStr(d.requested_document_type) || asStr(asDict(d.template).title),
    amount: 0,
    when: "",
    status,
    at: asStr(d.updated_at ?? d.created_at),
    route: kind === "pool" ? `/pro/docs/pool` : `/pro/docs/${id}`,
    action: needsAction(kind, status) || Boolean(d.can_claim),
    active: isActiveStatus(kind, status),
  };
}

// GET /lawyers/me/document-requests — requests assigned to this professional.
export async function listDocs(): Promise<ReqItem[]> {
  return listFrom(await http("/lawyers/me/document-requests"), "items", "data", "requests").map((v) => norm("docs", v));
}
// GET /call-center/document-requests/open — the open pool (call_center_lawyer only).
export async function listPool(): Promise<ReqItem[]> {
  return listFrom(await http("/call-center/document-requests/open"), "items", "data", "requests").map((v) => norm("pool", v));
}
