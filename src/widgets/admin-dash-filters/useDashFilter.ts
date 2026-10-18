import { useMemo, useState } from "react";
import { EMPTY_FILTER, type DashFilter } from "@/entities/admin-dash";
import { isDate, useDateRange } from "@/shared/ui/admin";

// Region + period state of a dashboard page. Half-typed custom dates are not sent to the API.
export function useDashFilter() {
  const bar = useDateRange("all");
  const [region, setRegion] = useState("");
  const from = isDate(bar.range.from) ? bar.range.from : "";
  const to = isDate(bar.range.to) ? bar.range.to : "";
  const filter = useMemo<DashFilter>(() => ({ ...EMPTY_FILTER, region, from, to }), [region, from, to]);
  return { filter, bar, region, setRegion };
}
export type DashFilterState = ReturnType<typeof useDashFilter>;
