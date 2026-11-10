import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";

// One category of the marketplace tree, flattened; `path` and `slugs` hold the backend's titles and slugs from the root down to this node.
export type CategoryRow = { id: string; path: string[]; slugs: string[] };

const isOff = (v: unknown): boolean => v === false || v === 0 || (typeof v === "string" && /^(false|0|no|off|inactive)$/i.test(v.trim()));
const ordered = (list: unknown[]): Record<string, unknown>[] =>
  list.map(asDict).map((d, at) => ({ d, at })).sort((a, b) => asNum(a.d.sort_order) - asNum(b.d.sort_order) || a.at - b.at).map((x) => x.d);

// Read like flattenCategoryTree on the web: parents before their children, an inactive category hides its whole branch.
export function normCategoryTree(v: unknown): CategoryRow[] {
  const rows: CategoryRow[] = [];
  const seen = new Set<string>();
  const walk = (list: unknown[], path: string[], slugs: string[]) => {
    for (const d of ordered(list)) {
      const id = asStr(d.id ?? d.category_id).trim();
      if (!id || seen.has(id) || isOff(d.is_active)) continue;
      seen.add(id);
      const title = asStr(d.title ?? d.name ?? d.slug).trim();
      const here = title ? [...path, title] : path;
      const slug = asStr(d.slug).trim();
      const mine = slug ? [...slugs, slug] : slugs;
      rows.push({ id, path: here, slugs: mine });
      walk(asArr(d.children ?? d.subcategories), here, mine);
    }
  };
  walk(listFrom(v, "items", "data", "categories"), [], []);
  return rows;
}

// GET /marketplace/service-category-tree — public.
export const getCategoryTree = async (): Promise<CategoryRow[]> => normCategoryTree(await http("/marketplace/service-category-tree"));
