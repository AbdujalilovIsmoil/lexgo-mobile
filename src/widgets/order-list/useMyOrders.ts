import { useMemo, useState } from "react";
import { entryText, mergeOrders, useMarketOrders, useMarketSync, type MarketStage, type OrderEntry } from "@/entities/order";
import { useIsAuthed } from "@/entities/session";

export type StageTab = "all" | MarketStage;
export type OrderSort = "new" | "old" | "high" | "low";
export const SORTS: OrderSort[] = ["new", "old", "high", "low"];
const priceOf = (e: OrderEntry): number => (e.kind === "market" ? e.order.price : 0);
export const STAGE_TABS: StageTab[] = ["all", "pending", "active", "completed", "cancelled"];

// "My orders" (web /portal/client/marketplace-orders): only the marketplace purchases from
// GET /marketplace/me/orders, a stage filter with counts and a text search. Document and other service
// orders (GET /orders) are not listed here; they live under "Mening ishlarim" / "Mening hujjatlarim".
export function useMyOrders() {
  const authed = useIsAuthed();
  useMarketSync();
  const market = useMarketOrders(authed);
  const [stage, setStage] = useState<StageTab>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<OrderSort>("new");
  const entries = useMemo(() => mergeOrders(market.data ?? [], []), [market.data]);
  const term = q.trim().toLowerCase();
  const searched = useMemo(() => (term ? entries.filter((e) => entryText(e).toLowerCase().includes(term)) : entries), [entries, term]);
  const counts = useMemo(() => {
    const c: Record<StageTab, number> = { all: searched.length, pending: 0, active: 0, completed: 0, cancelled: 0 };
    for (const e of searched) c[e.stage] += 1;
    return c;
  }, [searched]);
  const staged = stage === "all" ? searched : searched.filter((e) => e.stage === stage);
  const shown = useMemo(() => (sort === "new" ? staged : [...staged].sort((a, b) => (sort === "old" ? (a.at > b.at ? 1 : -1) : sort === "high" ? priceOf(b) - priceOf(a) : priceOf(a) - priceOf(b)))), [staged, sort]);
  const reset = () => { setStage("all"); setSort("new"); };
  const refetch = () => void market.refetch();
  return { authed, entries, shown, counts, stage, setStage, sort, setSort, reset, q, setQ, loading: market.isLoading, error: market.error, refetch, refreshing: market.isRefetching };
}
