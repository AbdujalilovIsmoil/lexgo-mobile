import type { Column, ColumnInput } from "./types";

// Columns with one of them moved a place up (-1) or down (+1); orders are renumbered 10, 20, 30… so ties never stick.
export function movedColumns(cols: Column[], key: string, dir: -1 | 1): Column[] {
  const at = cols.findIndex((c) => c.key === key);
  const to = at + dir;
  if (at < 0 || to < 0 || to >= cols.length) return cols;
  const next = cols.slice();
  [next[at], next[to]] = [next[to], next[at]];
  return next.map((c, i) => ({ ...c, order: (i + 1) * 10 }));
}

export const columnInputs = (cols: Column[]): ColumnInput[] => cols.map((c) => ({ key: c.key, title: c.title, color: c.color, order: c.order, isFinal: c.isFinal }));
