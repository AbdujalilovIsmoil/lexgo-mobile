import { ApiError } from "@/shared/api";
import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { AssignRefusal } from "./urgentTypes";

// A 422 from assign-group, told apart: below the service minimum (no override), a panel of the wrong
// size or an advocate off the request's direction (both may be overridden on purpose).
export function assignRefusal(e: unknown): AssignRefusal {
  if (!(e instanceof ApiError) || e.status !== 422) return null;
  const d = asDict(asDict(e.data).detail);
  const selected = asNum(d.selected_lawyer_count);
  if (e.code === "lawyer_count_below_minimum") return { kind: "minimum", requested: 0, selected, count: asNum(d.minimum_lawyer_count, 2) };
  if (e.code === "lawyer_count_mismatch") return { kind: "count", requested: asNum(d.requested_lawyer_count), selected, count: 0 };
  if (e.code === "lawyer_direction_mismatch") return { kind: "direction", requested: 0, selected, count: asArr(d.items).length };
  return null;
}
