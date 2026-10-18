import { ApiError } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { AssignRefusal } from "./types";

// Where the backend put the refusal code: ApiError.code, detail.code, a flat code, or only the sentence.
const codeOf = (e: ApiError): string => {
  const d = asDict(e.data.detail);
  return [e.code, asStr(d.code), asStr(e.data.code), e.detail ?? ""].filter(Boolean).join(" ");
};

// 402 previous_lexgo_advokat_service_required (old spelling: previous_lexgo_purchase_required) on the advocate panel.
export const isPriorPurchase = (e: unknown): boolean => e instanceof ApiError && e.status === 402 && /previous_lexgo_(purchase|advokat_service)_required/i.test(codeOf(e));

// 409 on claim: somebody else took the request first.
export const isConflict = (e: unknown): boolean => e instanceof ApiError && e.status === 409;

// A 422 from assign-group, told apart: below the service minimum (no override), a wrong panel size or an
// off-direction advocate (both may be overridden on purpose).
export function assignRefusal(e: unknown): AssignRefusal {
  if (!(e instanceof ApiError) || e.status !== 422) return null;
  const d = asDict(asDict(e.data).detail);
  const selected = asNum(d.selected_lawyer_count);
  if (e.code === "lawyer_count_below_minimum") return { kind: "minimum", requested: 0, selected, count: asNum(d.minimum_lawyer_count, 2) };
  if (e.code === "lawyer_count_mismatch") return { kind: "count", requested: asNum(d.requested_lawyer_count), selected, count: 0 };
  if (e.code === "lawyer_direction_mismatch") return { kind: "direction", requested: 0, selected, count: asArr(d.items).length };
  return null;
}
