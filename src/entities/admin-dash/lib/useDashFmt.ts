import { useCallback, useMemo } from "react";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

export const DASH = "—";

// Number formatting of the dashboards: whole so'm, compact mln/mlrd for tiles, percents, ratings, m:ss.
export function useDashFmt() {
  const { t, locale } = useT();
  const comma = useCallback((x: number, digits: number) => x.toFixed(digits).replace(/\.0+$/, "").replace(".", locale === "en" ? "." : ","), [locale]);
  return useMemo(() => {
    const cur = t("adm.currency");
    const money = (n?: number) => `${fmtMoney(n ?? 0)} ${cur}`;
    const moneyOrDash = (n?: number) => (n ? money(n) : DASH);
    const short = (n?: number) => {
      if (!n) return DASH;
      const a = Math.abs(n);
      if (a >= 1e9) return `${comma(n / 1e9, 2)} ${t("admDash.units.mlrd")} ${cur}`;
      return a >= 1e6 ? `${comma(n / 1e6, 1)} ${t("admDash.units.mln")} ${cur}` : money(n);
    };
    const pct = (n?: number) => (n == null ? DASH : `${comma(n, 1)}%`);
    const int = (n?: number) => (n == null ? DASH : fmtMoney(n));
    const rating = (n?: number) => (n ? comma(n, 1) : DASH);
    const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
    return { money, moneyOrDash, short, pct, int, rating, mmss };
  }, [t, comma]);
}
