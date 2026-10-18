import { useMemo } from "react";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { DASH } from "./useDashFmt";

// Backend slugs → translated labels (unknown ones are tidied, never shown raw).
export function useDashLabels() {
  const { t } = useT();
  return useMemo(() => {
    const pick = (prefixes: string[], k: string) => {
      for (const p of prefixes) if (t(`${p}.${k}`) !== `${p}.${k}`) return t(`${p}.${k}`);
      return humanizeSlug(k);
    };
    return {
      stage: (k: string) => pick(["admDashC.stage"], k),
      score: (k: string) => pick(["admDashC.score"], k),
      status: (k: string) => pick(["admDashC.status", "admSt"], k),
      role: (k: string) => pick(["admDash.role"], k),
      region: (k: string) => pick(["admDash.region"], k),
      source: (k: string) => (k ? pick(["admCeoB.source"], k) : DASH),
      reason: (k: string) => pick(["admRet.reason"], k),
      severity: (k: string) => pick(["admDashC.severity"], k),
    };
  }, [t]);
}
