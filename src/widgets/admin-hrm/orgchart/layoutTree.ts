import type { OrgNode } from "@/entities/admin-hrm";
import { GAP_X, GAP_Y, LINE, NODE_H, NODE_W, type Bar, type Layout, type Placed } from "./chartTypes";
import { indexTree } from "./treeIndex";

// Top-down tidy tree of the org units: every parent is centred above its children, siblings sit side by side.
// People of a unit are not boxes of their own; their names ride on the unit card.
export function layoutTree(nodes: OrgNode[]): Layout {
  const { roots, kids, people, span } = indexTree(nodes);
  const placed: Placed[] = [];
  const bars: Bar[] = [];
  const done = new Set<string>();
  let depthMax = 0;
  const put = (n: OrgNode, left: number, depth: number) => {
    if (done.has(n.id)) return;
    done.add(n.id);
    const w = span.get(n.id) ?? NODE_W;
    const cx = left + w / 2;
    const y = depth * (NODE_H + GAP_Y);
    depthMax = Math.max(depthMax, depth);
    placed.push({ node: n, x: cx - NODE_W / 2, y, people: people.get(n.id) ?? [] });
    const c = (kids.get(n.id) ?? []).filter((k) => !done.has(k.id));
    if (!c.length) return;
    const total = c.reduce((sum, k) => sum + (span.get(k.id) ?? NODE_W), 0) + GAP_X * (c.length - 1);
    let at = left + (w - total) / 2;
    const midY = y + NODE_H + GAP_Y / 2;
    const centres = c.map((k) => {
      const kw = span.get(k.id) ?? NODE_W;
      put(k, at, depth + 1);
      at += kw + GAP_X;
      return at - GAP_X - kw / 2;
    });
    const lo = Math.min(...centres);
    bars.push({ x: cx - LINE / 2, y: y + NODE_H, w: LINE, h: GAP_Y / 2 });
    bars.push({ x: lo, y: midY - LINE / 2, w: Math.max(...centres) - lo + LINE, h: LINE });
    centres.forEach((x) => bars.push({ x: x - LINE / 2, y: midY, w: LINE, h: GAP_Y / 2 }));
  };
  let x0 = 0;
  for (const r of roots) {
    put(r, x0, 0);
    x0 += (span.get(r.id) ?? NODE_W) + GAP_X * 2;
  }
  return { placed, bars, width: Math.max(NODE_W, x0 - GAP_X * 2), height: (depthMax + 1) * (NODE_H + GAP_Y) - GAP_Y };
}
