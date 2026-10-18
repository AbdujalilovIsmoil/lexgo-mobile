import { http } from "@/shared/api";
import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { B2bDocument, DocRequest } from "../model/types";

export const VAT_PERCENT = 12;

function normDoc(v: unknown): B2bDocument {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    fileUrl: asStr(d.file_url),
    total: asNum(p.total ?? d.price ?? p.invoice_total),
    vatAmount: asNum(p.vat_amount),
    vatPercent: asNum(p.vat_percent),
    taskCount: p.task_count != null ? asNum(p.task_count) : undefined,
    period: asStr(p.period),
  };
}

// Invoice (POST …/invoice, VAT shown separately), contract (POST …/contract) or monthly report
// (GET …/monthly-report?month=YYYY-MM). Each answers with the record and `file_url` of the PDF.
export async function makeDocument(r: DocRequest): Promise<B2bDocument> {
  const base = `/b2b/clients/${encodeURIComponent(r.client.id)}`;
  if (r.kind === "invoice") {
    const body = { amount_without_vat: r.amount, vat_percent: VAT_PERCENT, description: r.description || undefined };
    return normDoc(await http(`${base}/invoice`, { method: "POST", body }));
  }
  if (r.kind === "contract") return normDoc(await http(`${base}/contract`, { method: "POST", body: {} }));
  return normDoc(await http(`${base}/monthly-report?month=${encodeURIComponent(r.month)}`));
}
