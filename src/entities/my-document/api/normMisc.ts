import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { DocCall, DocChat, DocPreview, MissingField, UnlockPolicy } from "../model/docTypes";

const missingOf = (v: unknown): MissingField[] =>
  asArr(v).map((x) => ({ name: asStr(asDict(x).name ?? asDict(x).key), label: asStr(asDict(x).label) })).filter((m) => m.name);


export function normPolicy(v: unknown): UnlockPolicy {
  const d = asDict(v);
  return {
    paid: d.paid === true,
    requiresPayment: d.requires_payment === true,
    canGenerate: d.can_generate === true,
    amount: uzs(d, "amount"),
    currency: asStr(d.currency, "UZS"),
    formats: asArr(d.formats).map((f) => asStr(f).toLowerCase()).filter(Boolean),
    missing: missingOf(d.missing_required_fields),
  };
}

export function normPreview(v: unknown): DocPreview {
  const d = asDict(v);
  return { text: asStr(d.preview_text ?? d.final_text), canGenerate: d.can_generate === true, percent: asNum(d.completion_percent), missing: missingOf(d.missing_required_fields) };
}

// available:false is a state ("nobody has taken it yet"), not an error.
export function normChat(v: unknown): DocChat {
  const d = asDict(v);
  const room = asDict(d.room);
  return { available: d.available === true, roomId: asStr(room.id ?? room.room_id ?? d.room_id), message: asStr(d.message) };
}

export function normCall(v: unknown): DocCall {
  const d = asDict(v);
  const u = asDict(d.client_call_usage);
  return { id: asStr(d.id), roomId: asStr(d.room_id), remaining: "remaining" in u ? asNum(u.remaining) : null };
}
