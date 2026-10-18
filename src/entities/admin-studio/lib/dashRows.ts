import type { StudioConstructor } from "../model/types";
import type { StudioGroup } from "../model/typesNav";

export type DashRow = { type: "group"; group: StudioGroup; shown: number } | { type: "ctor"; item: StudioConstructor; group: StudioGroup };

// Flat rows for the catalogue list: groups in the order the server sent, constructors in their sequence order.
// `only` limits to one group; empty groups are dropped. Nothing is sorted by name.
export function dashRows(groups: StudioGroup[], match: (c: StudioConstructor) => boolean, only = ""): DashRow[] {
  return groups
    .filter((g) => !only || g.key === only)
    .flatMap((group) => {
      const items = group.items.filter(match);
      return items.length ? [{ type: "group" as const, group, shown: items.length }, ...items.map((item) => ({ type: "ctor" as const, item, group }))] : [];
    });
}
