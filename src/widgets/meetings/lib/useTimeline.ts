import { isLive, type Invited } from "@/entities/call";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { dayLabel, groupByDay } from "./groupByDay";

// The meetings of one tab, filtered by the search text: the live ones apart, the rest grouped by day.
export function useTimeline(items: Invited[], search: string) {
  const { t, locale } = useT();
  const needle = search.trim().toLowerCase();
  const list = items.filter((m) => `${m.title} ${m.callerName}`.toLowerCase().includes(needle));
  const live = list.filter((m) => isLive(m.callStatus));
  const now = new Date();
  const sections = groupByDay(list.filter((m) => !isLive(m.callStatus)), (iso) => dayLabel(iso, now, t("ms7.today"), t("ms7.yesterday"), (x) => fmtDate(x, locale)));
  return { live, sections };
}
