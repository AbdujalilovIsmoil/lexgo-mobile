import { useT } from "@/shared/i18n";
import { Notice } from "@/shared/ui/sel";
import { ConfigCard } from "./ConfigCard";
import { RequirementRow } from "./RequirementRow";
import type { ServiceConfig } from "./types";

// How much higher the price ceiling can still go and what it takes (TZ.md "Pricing Growth" §2): the backend's
// maximum_increase_percent in the recommended sentence — hidden at 0 — and every criterion it evaluated. Nothing is computed here.
export function GrowthCard({ config: c }: { config: ServiceConfig }) {
  const { t } = useT();
  const grow = c.maxIncreasePercent > 0;
  if (!grow && !c.requirements.length) return null;
  return (
    <ConfigCard title={t("svcRules.cfgReqTitle")}>
      {grow ? <Notice icon="trending-up" text={t("scfg.growth", { pct: c.maxIncreasePercent })} /> : null}
      {c.requirements.map((r, i) => <RequirementRow key={`${r.key}-${i}`} r={r} />)}
    </ConfigCard>
  );
}
