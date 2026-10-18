import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { CaseDoc, ReplacementEvent } from "../model/types";

type Rec = { id: string; status: string; title: string; caseId: string };

const rec = (v: unknown): Rec => {
  const d = asDict(v);
  return { id: asStr(d.id), status: asStr(d.status), title: asStr(d.title), caseId: asStr(asDict(d.payload).case_id) };
};

// POST /refund-requests | /replacement-requests — module record with the case in its payload.
export async function sendCaseRequest(kind: "refund" | "replacement", c: { id: string; orderId: string; label: string }, reason: string): Promise<void> {
  const payload = { case_id: c.id, order_id: c.orderId, reason: reason.trim() };
  const body = kind === "refund"
    ? { record_type: "", title: `${c.label} — refund`, status: "active", price: 0, currency: "UZS", payload }
    : { record_type: "replacement", title: `${c.label} — replacement`, status: "pending", price: 0, currency: "UZS", payload };
  await http(kind === "refund" ? "/refund-requests" : "/replacement-requests", { method: "POST", body });
}

// GET /replacement-requests/me, then /replacement-requests/{id}/history of this case's request.
export async function caseReplacement(caseId: string): Promise<ReplacementEvent[]> {
  const mine = listFrom(await http("/replacement-requests/me"), "items", "data").map(rec).find((r) => r.caseId === caseId);
  if (!mine?.id) return [];
  return listFrom(await http(`/replacement-requests/${mine.id}/history`), "items", "data").map((x) => {
    const d = asDict(x);
    return { id: asStr(d.id), status: asStr(d.status ?? asDict(d.payload).status), createdAt: asStr(d.created_at) };
  });
}

// GET /case-documents, kept for this case only.
export async function listCaseDocs(caseId: string): Promise<CaseDoc[]> {
  return listFrom(await http("/case-documents"), "items", "data")
    .filter((x) => rec(x).caseId === caseId)
    .map((x) => ({ id: rec(x).id, title: rec(x).title, status: rec(x).status }));
}

// POST /case-documents
export async function addCaseDoc(caseId: string, title: string): Promise<void> {
  await http("/case-documents", { method: "POST", body: { record_type: "", title: title.trim(), status: "active", price: 0, currency: "UZS", payload: { case_id: caseId } } });
}
