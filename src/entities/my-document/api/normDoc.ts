import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { MyDoc } from "../model/docTypes";
import { sortFields } from "../lib/fields";
import { docFileName } from "../lib/title";
import { baseRow } from "./normRow";
import { normField, normGate } from "./normBits";

// GET /document-requests/{id}: the full request with its questionnaire and answers.
export function normDoc(v: unknown): MyDoc {
  const d = asDict(v);
  const row = baseRow(d);
  const cf = asDict(d.contract_file);
  const fields = asArr(d.questionnaire ?? d.fields).map(normField).filter((f) => f.name);
  return {
    ...row,
    documentType: asStr(d.document_type),
    fields: sortFields(fields),
    answers: asDict(d.answers),
    paid: d.paid === true,
    requiresPayment: d.requires_payment === true,
    paymentStatus: asStr(d.payment_status),
    paymentId: asStr(d.payment_id),
    gate: normGate(d.payment_gate),
    pageCount: asNum(d.page_count),
    file: row.fileReady ? { name: docFileName(row.title, row.format, "document"), mime: asStr(cf.mime_type), path: `/document-requests/${row.id}/file` } : null,
    updatedAt: asStr(d.updated_at),
  };
}
