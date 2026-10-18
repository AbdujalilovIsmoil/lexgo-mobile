import type { OrgNode } from "@/entities/admin-hrm";

export type OrgRow = { node: OrgNode; depth: number; open: boolean; kids: number };

// Units that start expanded: the root and its direct sub-units.
export const defaultOpen = (nodes: OrgNode[]): Set<string> => new Set(nodes.filter((n) => n.kind === "unit" && n.level < 2).map((n) => n.id));

// Flatten the board into the visible rows of an indented tree (people first, then sub-units).
export function treeRows(nodes: OrgNode[], open: Set<string>): OrgRow[] {
  const ids = new Set(nodes.map((n) => n.id));
  const kidsOf = new Map<string, OrgNode[]>();
  for (const n of nodes) {
    const parent = n.parentId && ids.has(n.parentId) ? n.parentId : "";
    kidsOf.set(parent, [...(kidsOf.get(parent) ?? []), n]);
  }
  const rows: OrgRow[] = [];
  const walk = (n: OrgNode, depth: number) => {
    const kids = kidsOf.get(n.id) ?? [];
    rows.push({ node: n, depth, open: open.has(n.id), kids: kids.length });
    if (!open.has(n.id)) return;
    kids.filter((k) => k.kind === "person").forEach((k) => walk(k, depth + 1));
    kids.filter((k) => k.kind === "unit").forEach((k) => walk(k, depth + 1));
  };
  (kidsOf.get("") ?? []).filter((n) => n.kind === "unit").forEach((n) => walk(n, 0));
  return rows;
}

// A search shows the matching units and people as a flat list instead of the tree.
export function searchRows(nodes: OrgNode[], q: string): OrgRow[] {
  const needle = q.trim().toLowerCase();
  return nodes.filter((n) => `${n.label} ${n.sub}`.toLowerCase().includes(needle)).map((node) => ({ node, depth: 0, open: false, kids: 0 }));
}
