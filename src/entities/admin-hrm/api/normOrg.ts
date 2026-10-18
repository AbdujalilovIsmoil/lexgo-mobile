import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { OrgBoard, OrgNode } from "../model/types";

function node(v: unknown): OrgNode {
  const d = asDict(v);
  const kind = asStr(d.type) === "employee" ? "person" : "unit";
  return {
    id: asStr(d.id), entityId: asStr(d.entity_id), kind, label: asStr(d.label), sub: asStr(d.subtitle), parentId: asStr(d.parent_id),
    unitType: asStr(d.unit_type), people: asNum(d.people_count), positions: asNum(d.position_count), level: asNum(d.level),
    children: asNum(d.children_count), head: asStr(asDict(d.head).display_name),
  };
}

// GET /internal/org/board?include=people → flat nodes (units and people) linked by parent_id, plus counters.
export function normBoard(v: unknown): OrgBoard {
  const board = asDict(asDict(v).board);
  const s = asDict(board.stats);
  return {
    nodes: asArr(board.nodes).map(node),
    stats: { units: asNum(s.units), employees: asNum(s.employees), assignments: asNum(s.assignments), roots: asNum(s.roots), levels: asNum(s.levels) },
  };
}
