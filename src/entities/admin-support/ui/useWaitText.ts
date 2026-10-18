import { useT } from "@/shared/i18n";
import { minutesSince } from "../lib/time";

// "12 min waiting" / "3 h 5 min waiting" for tickets that nobody has taken yet.
export function useWaitText() {
  const { t } = useT();
  return (iso: string) => {
    const m = minutesSince(iso);
    return m < 1 ? t("admSup.wait.now") : m < 60 ? t("admSup.wait.min", { n: m }) : m < 1440 ? t("admSup.wait.hour", { h: Math.floor(m / 60), m: m % 60 }) : t("admSup.wait.day", { n: Math.floor(m / 1440) });
  };
}

// Compact age for a stat tile: "12 daq", "3 s 5 d", "2 kun".
export function useWaitShort() {
  const { t } = useT();
  return (iso: string) => {
    const m = minutesSince(iso);
    return m < 60 ? t("admSup.hero.min", { n: m }) : m < 1440 ? t("admSup.hero.hour", { h: Math.floor(m / 60), m: m % 60 }) : t("admSup.hero.day", { n: Math.floor(m / 1440) });
  };
}
