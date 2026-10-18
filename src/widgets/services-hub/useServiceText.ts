import type { DocFilter, ExecFilter, PriceFilter, SvcSort } from "@/entities/service";
import { useT } from "@/shared/i18n";

const DOC = { all: "filterAll", template: "filterHasDoc", lawyer: "filterNoDoc" };
const EXEC = { all: "filterAll", ai: "execAi", yurist: "execYurist", advokat: "execAdvokat" };
const PRICE = { all: "filterAll", free: "filterFree", low: "priceBandLow", mid: "priceBandMid", high: "priceBandHigh" };
const SORT = { rel: "sortRelevance", az: "sortByName", cheap: "sortCheapFirst", doc: "sortDocFirst" };

// Words of the existing catalogue filters (csv.*), by value.
export function useServiceText() {
  const { t } = useT();
  return {
    doc: (v: DocFilter) => t(`csv.${DOC[v]}`),
    exec: (v: ExecFilter) => t(`csv.${EXEC[v]}`),
    price: (v: PriceFilter) => t(`csv.${PRICE[v]}`),
    sort: (v: SvcSort) => t(`csv.${SORT[v]}`),
  };
}
