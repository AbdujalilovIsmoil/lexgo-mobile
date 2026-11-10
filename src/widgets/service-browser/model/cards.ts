import type { CategoryRow, MarketBrowse } from "@/entities/lawyer";

export type BrowseCard = { id: string; title: string; categoryId: string; basePrice: number; sellers: number };
export type CategoryLabels = ReadonlyMap<string, string>;

const SEP = " › ";

// The chips' labels: the tree's whole path when it answered, else the flat categories that came with the catalogue.
export function categoryLabels(tree: readonly CategoryRow[], browse: MarketBrowse | undefined, name: (title: string) => string): CategoryLabels {
  if (tree.length) return new Map(tree.map((r) => [r.id, r.path.map(name).join(SEP)]));
  return new Map((browse?.meta.categories ?? []).map((c) => [c.id, name(c.title)]));
}

// Each category's slugs, for its icon: the tree's when it answered, else the flat category's own.
export function categorySlugs(tree: readonly CategoryRow[], browse: MarketBrowse | undefined): ReadonlyMap<string, readonly string[]> {
  if (tree.length) return new Map(tree.map((r) => [r.id, r.slugs]));
  return new Map((browse?.meta.categories ?? []).map((c) => [c.id, c.slug ? [c.slug] : []]));
}

// Every service of the catalogue with how many specialists offer it. A service outside the
// active tree is not shown; without a tree (it failed) nothing is cut.
export function buildCards(browse: MarketBrowse | undefined, tree: readonly CategoryRow[]): BrowseCard[] {
  if (!browse) return [];
  const known = tree.length ? new Set(tree.map((r) => r.id)) : null;
  const sellers = new Map<string, number>();
  for (const l of browse.sellers) for (const x of l.services) sellers.set(x.id, (sellers.get(x.id) ?? 0) + 1);
  const src = browse.meta.services.length ? browse.meta.services : browse.sellers.flatMap((l) => l.services);
  const cards = new Map<string, BrowseCard>();
  for (const x of src) {
    if (!x.id || !x.title || cards.has(x.id) || (known && !known.has(x.categoryId))) continue;
    cards.set(x.id, { id: x.id, title: x.title, categoryId: x.categoryId, basePrice: x.basePrice, sellers: sellers.get(x.id) ?? 0 });
  }
  return [...cards.values()];
}

// Where a horizontal rail scrolls to center a tab, kept inside the rail's own range so the first and last tabs stop at its edges.
export function tabOffset(x: number, width: number, view: number, content: number): number {
  return Math.max(0, Math.min(x - (view - width) / 2, content - view));
}

// Only the categories somebody sells in earn a chip.
export const usedCategories = (cards: readonly BrowseCard[], labels: CategoryLabels): string[] =>
  [...new Set(cards.filter((c) => c.sellers > 0).map((c) => c.categoryId))].filter((id) => labels.has(id));

// What the search and the chip leave, services someone offers first and the most offered on top.
export function filterCards(cards: readonly BrowseCard[], cat: string, q: string, labels: CategoryLabels): BrowseCard[] {
  const needle = q.trim().toLowerCase();
  return cards
    .filter((c) => (!cat || c.categoryId === cat) && (!needle || c.title.toLowerCase().includes(needle) || (labels.get(c.categoryId) ?? "").toLowerCase().includes(needle)))
    .sort((a, b) => Number(b.sellers > 0) - Number(a.sellers > 0) || b.sellers - a.sellers || a.title.localeCompare(b.title));
}
