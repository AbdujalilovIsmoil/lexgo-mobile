import { dayKey, hhmm } from "@/shared/lib/pro/dates";
import { fmtDate } from "@/shared/lib/format";

type T = (key: string, vars?: Record<string, string | number>) => string;
const shift = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dayKey(d.toISOString());
};

// "Today 18:00" / "Tomorrow 10:00" / "Yesterday 09:00", else the date and the time.
export function dueText(iso: string, t: T, locale: string): string {
  if (!iso) return t("ttm.noDeadline");
  const day = dayKey(iso);
  const time = hhmm(iso);
  if (day === shift(0)) return t("ttm.due.today", { time });
  if (day === shift(1)) return t("ttm.due.tomorrow", { time });
  if (day === shift(-1)) return t("ttm.due.yesterday", { time });
  return `${fmtDate(iso, locale)} ${time}`;
}
