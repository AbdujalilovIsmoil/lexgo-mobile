import { useMemo, useState } from "react";
import { useCategoryTree, useMarketBrowse } from "@/entities/lawyer";
import { marketStageOf, useMarketOrders } from "@/entities/order";
import { useIsAuthed } from "@/entities/session";
import { useLocaleStore } from "@/shared/i18n";
import { categoryTitleName } from "@/shared/lib/categoryNames";
import { buildCards, categoryLabels, categorySlugs, filterCards, usedCategories } from "./model/cards";

// Browsing by service (web /portal/client/lawyers?mode=services), with the web's three reads: the category tree
// (GET /marketplace/service-category-tree), the services and who sells them (GET /marketplace/lawyers?include_meta=true) and, signed in,
// the client's own orders (GET /marketplace/me/orders): an unfinished one marks its service as bought.
export function useServiceBrowser() {
  const locale = useLocaleStore((x) => x.locale);
  const authed = useIsAuthed();
  const browse = useMarketBrowse();
  const tree = useCategoryTree();
  const orders = useMarketOrders(authed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const rows = useMemo(() => tree.data ?? [], [tree.data]);
  const labels = useMemo(() => categoryLabels(rows, browse.data, (title) => categoryTitleName(title, locale)), [rows, browse.data, locale]);
  const slugs = useMemo(() => categorySlugs(rows, browse.data), [rows, browse.data]);
  const cards = useMemo(() => buildCards(browse.data, rows), [browse.data, rows]);
  const chips = useMemo(() => usedCategories(cards, labels), [cards, labels]);
  const shown = useMemo(() => filterCards(cards, cat, q, labels), [cards, cat, q, labels]);
  // The same colour for one category in every card, whatever the filter leaves.
  const hueIds = useMemo(() => [...new Set(cards.map((c) => c.categoryId))], [cards]);
  const bought = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of orders.data ?? []) {
      const stage = marketStageOf(o);
      if (o.serviceId && (stage === "pending" || stage === "active") && !map.has(o.serviceId)) map.set(o.serviceId, o.id);
    }
    return map;
  }, [orders.data]);
  const refetch = () => Promise.all([browse.refetch(), tree.refetch(), ...(authed ? [orders.refetch()] : [])]);
  return { authed, q, setQ, cat, setCat, labels, slugs, chips, shown, total: cards.length, hueIds, bought, refetch, loading: browse.isLoading, error: browse.data ? null : browse.error };
}
