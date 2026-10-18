import { useState } from "react";
import { NO_FILTERS, activeCount, type Filters } from "@/entities/market-feed";

// Search, region, budget band, arrival window and sort of the feed in one place; `active` feeds the badge on the filter button.
export function useMarketFilters() {
  const [f, setF] = useState<Filters>(NO_FILTERS);
  return { f, set: (p: Partial<Filters>) => setF((x) => ({ ...x, ...p })), reset: () => setF((x) => ({ ...NO_FILTERS, q: x.q })), clear: () => setF(NO_FILTERS), active: activeCount(f) };
}
export type MarketFilters = ReturnType<typeof useMarketFilters>;
