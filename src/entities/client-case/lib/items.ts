import type { CaseItem, CaseOrder, ClientCase } from "../model/types";

// A case with its order, then every order that has no case yet.
export function joinItems(cases: ClientCase[], orders: CaseOrder[]): CaseItem[] {
  const byId = new Map(orders.map((o) => [o.id, o]));
  const linked = new Set<string>();
  const rows: CaseItem[] = cases.map((c) => {
    if (c.orderId) linked.add(c.orderId);
    return { key: `c:${c.id}`, case: c, order: c.orderId ? byId.get(c.orderId) : undefined };
  });
  for (const o of orders) if (!linked.has(o.id)) rows.push({ key: `o:${o.id}`, order: o });
  return rows;
}
