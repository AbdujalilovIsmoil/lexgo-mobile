import { useState } from "react";
import { NO_PRO_FILTERS, activeProCount, type ProFilters } from "@/entities/urgent";

// Search, status, period and sort of the list in one place; `active` feeds the badge on the filter button.
export function useProFilters() {
  const [f, setF] = useState<ProFilters>(NO_PRO_FILTERS);
  return { f, set: (p: Partial<ProFilters>) => setF((x) => ({ ...x, ...p })), reset: () => setF((x) => ({ ...NO_PRO_FILTERS, q: x.q })), clear: () => setF(NO_PRO_FILTERS), active: activeProCount(f) };
}
export type ProFiltersState = ReturnType<typeof useProFilters>;
