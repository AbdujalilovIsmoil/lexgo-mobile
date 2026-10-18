import { useCallback } from "react";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import type { DrillRow } from "../model/drillTypes";
import type { DashListItem } from "../model/types";
import { useDashFmt } from "./useDashFmt";
import { useDashLabels } from "./useDashLabels";

// A record of a dashboard list (task, B2B client, review, payment …) as a drill row:
// name left, amount or status right, the remaining facts underneath.
export function useListRow() {
  const { locale } = useT();
  const fmt = useDashFmt();
  const label = useDashLabels();
  return useCallback((i: DashListItem): DrillRow => {
    const status = i.status ? label.status(i.status) : "";
    return {
      label: i.title || i.meta || `#${i.id.slice(0, 8)}`,
      value: i.amount ? fmt.money(i.amount) : status,
      sub: [i.amount ? status : "", i.title && i.meta ? i.meta : "", fmtDate(i.date, locale)].filter(Boolean).join(" · "),
    };
  }, [locale, fmt, label]);
}
