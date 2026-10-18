import { asDict, asNum } from "@/shared/lib/json";
import type { CtorNav } from "../model/typesNav";
import { boolOf, first, strings } from "./norm";

// The catalogue position of a constructor; undefined when the server sent no `navigation` (old backend).
export function normNav(r: Record<string, unknown>): CtorNav | undefined {
  const n = asDict(r.navigation);
  if (!Object.keys(n).length) return undefined;
  return {
    group: first(n.group_key),
    step: asNum(n.step_number, 0),
    steps: asNum(n.step_count, 0),
    before: strings(n.required_before),
    recommended: strings(n.recommended_before),
    next: strings(n.next_steps),
    availability: first(r.availability) || "available",
    missing: strings(r.missing_required),
    completed: boolOf(r.completed) === true,
    records: asNum(r.record_count, 0),
    contextFields: strings(asDict(r.operations).context_fields),
  };
}
