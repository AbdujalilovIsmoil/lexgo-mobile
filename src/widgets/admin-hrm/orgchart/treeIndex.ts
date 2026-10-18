import type { OrgNode } from "@/entities/admin-hrm";
import { GAP_X, NODE_W } from "./chartTypes";

export type TreeIndex = { roots: OrgNode[]; kids: Map<string, OrgNode[]>; people: Map<string, string[]>; span: Map<string, number> };

// Parent → children of the org units, the people names per unit, and the width every subtree needs.
export function indexTree(nodes: OrgNode[]): TreeIndex {
  const units = nodes.filter((n) => n.kind === "unit");
  const ids = new Set(units.map((n) => n.id));
  const kids = new Map<string, OrgNode[]>();
  const people = new Map<string, string[]>();
  for (const n of units) {
    const parent = n.parentId && ids.has(n.parentId) && n.parentId !== n.id ? n.parentId : "";
    kids.set(parent, [...(kids.get(parent) ?? []), n]);
  }
  for (const n of nodes) if (n.kind === "person") people.set(n.parentId, [...(people.get(n.parentId) ?? []), n.label]);
  const span = new Map<string, number>();
  const measure = (n: OrgNode): number => {
    if (span.has(n.id)) return NODE_W;
    span.set(n.id, NODE_W);
    const c = kids.get(n.id) ?? [];
    const w = Math.max(NODE_W, c.reduce((sum, k) => sum + measure(k), 0) + GAP_X * Math.max(0, c.length - 1));
    span.set(n.id, w);
    return w;
  };
  const roots = kids.get("") ?? [];
  roots.forEach(measure);
  return { roots, kids, people, span };
}
