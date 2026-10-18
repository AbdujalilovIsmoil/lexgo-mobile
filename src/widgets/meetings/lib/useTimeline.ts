import { useMemo } from "react";
import type { Invited } from "@/entities/call";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { dayLabel, groupByDay } from "./groupByDay";
import { dayCounts, onDay, phaseOf } from "./week";

// The meetings of one tab: filtered by the search text, the running ones apart (always on top), the rest narrowed to the
// chosen day and grouped by day. `counts` (meetings per day) drive the dots of the week strip.
export function useTimeline(items: Invited[], search: string, day: string | null) {
  const { t, locale } = useT();
  const today = t("ms7.today");
  const yesterday = t("ms7.yesterday");
  return useMemo(() => {
    const needle = search.trim().toLowerCase();
    const now = new Date();
    const list = items.filter((m) => `${m.title} ${m.callerName}`.toLowerCase().includes(needle));
    const live = list.filter((m) => phaseOf(m, now) === "live");
    const rest = list.filter((m) => phaseOf(m, now) !== "live");
    const shown = onDay(rest, day);
    const sections = groupByDay(shown, (iso) => dayLabel(iso, now, today, yesterday, (x) => fmtDate(x, locale)));
    return { live, sections, counts: dayCounts(rest), shown: shown.length, filtered: !!needle };
  }, [items, search, day, today, yesterday, locale]);
}
