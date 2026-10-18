import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { StudioConstructor } from "../model/types";
import type { StudioGroup } from "../model/typesNav";
import { first, listOf } from "./norm";
import { normConstructor } from "./normConstructor";

const items = (v: unknown): StudioConstructor[] => asArr(v).map(normConstructor).filter((c) => c.code);

// The ten groups exactly as the server ordered them (its numeric `order`; ties keep arrival order). Never sorted by name.
export function normGroups(raw: unknown): StudioGroup[] {
  const groups = asArr(asDict(raw).groups).map((g, i) => {
    const d = asDict(g);
    const list = items(d.constructors);
    return {
      i,
      g: {
        key: first(d.key),
        title: first(d.title),
        order: asNum(d.order, i + 1),
        description: first(d.description),
        completed: asNum(d.completed_count, list.filter((c) => c.nav?.completed).length),
        total: asNum(d.constructor_count, list.length),
        progress: asNum(d.progress_percent, 0),
        next: first(d.next_constructor_code),
        items: list,
      } as StudioGroup,
    };
  });
  return groups.filter((x) => x.g.key).sort((a, b) => a.g.order - b.g.order || a.i - b.i).map((x) => x.g);
}

// Flat list: the groups' constructors in group order, else the legacy `items` array.
export const flatItems = (raw: unknown, groups: StudioGroup[]): StudioConstructor[] =>
  groups.length ? groups.flatMap((g) => g.items) : items(listOf(raw, ["items", "constructors"]));
