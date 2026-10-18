import type { AssignStrategy, Assignment, Lead, Operator } from "./types";

const key = (r: string) => r.trim().toLowerCase();

// Plan a distribution of the UNASSIGNED leads over the operators. An operator in the lead's
// region is preferred (else everyone is a candidate). round_robin walks the operator list with
// one global cursor; least_loaded picks the candidate with the fewest leads, counting those
// already assigned. Pure: nothing is saved here.
export function autoAssign(leads: Lead[], operators: Operator[], strategy: AssignStrategy): Assignment[] {
  if (!operators.length) return [];
  const load = new Map<string, number>(operators.map((o) => [o.id, 0]));
  for (const l of leads) if (l.assignedTo && load.has(l.assignedTo)) load.set(l.assignedTo, (load.get(l.assignedTo) ?? 0) + 1);
  let cursor = 0;
  const out: Assignment[] = [];
  for (const lead of leads) {
    if (lead.assignedTo) continue;
    const same = key(lead.region) ? operators.filter((o) => key(o.region) === key(lead.region)) : [];
    const pool = same.length ? same : operators;
    let pick = pool[0];
    if (strategy === "least_loaded") {
      for (const o of pool) if ((load.get(o.id) ?? 0) < (load.get(pick.id) ?? 0)) pick = o;
    } else {
      for (let i = 0; i < operators.length; i++) {
        const j = (cursor + i) % operators.length;
        if (pool.includes(operators[j])) {
          pick = operators[j];
          cursor = j + 1;
          break;
        }
      }
    }
    load.set(pick.id, (load.get(pick.id) ?? 0) + 1);
    out.push({ lead, operator: pick });
  }
  return out;
}
