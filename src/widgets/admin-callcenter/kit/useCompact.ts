import { useT } from "@/shared/i18n";

// 45 daq · 3 soat · 12 kun — short age text for badges.
export function useCompact(): (min: number) => string {
  const { t } = useT();
  return (m) => {
    const v = Math.max(0, Math.round(m));
    return v >= 1440 ? t("admCcH.d", { n: Math.floor(v / 1440) }) : v >= 60 ? t("admCcH.h", { n: Math.floor(v / 60) }) : t("admCcH.m", { n: v });
  };
}
