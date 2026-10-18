import { useState } from "react";
import { NO_ORDER_FILTERS, orderActiveCount, type OrderFilters } from "@/entities/pro-order";

// Search, stage, period, price band and sort of the seller's orders in one place; `active` feeds the badge on the filter button.
export function useOrderFilters() {
  const [f, setF] = useState<OrderFilters>(NO_ORDER_FILTERS);
  return { f, set: (p: Partial<OrderFilters>) => setF((x) => ({ ...x, ...p })), reset: () => setF((x) => ({ ...NO_ORDER_FILTERS, q: x.q })), clear: () => setF(NO_ORDER_FILTERS), active: orderActiveCount(f) };
}
export type OrderFiltersState = ReturnType<typeof useOrderFilters>;
