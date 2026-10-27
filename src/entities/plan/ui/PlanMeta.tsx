import type { Plan } from "../model/types";
import { audienceKind } from "../lib/planInfo";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";

// One caption line under a tariff's price: who it is for, the published version and the day it took effect — only what the backend sent.
export function PlanMeta({ plan }: { plan: Plan }) {
  const { t, locale } = useT();
  const kind = audienceKind(plan);
  const line = [
    kind ? t(`subq.plan.for.${kind}`) : "",
    plan.versioned ? t("subq.plan.version", { n: plan.version }) : "",
    plan.effectiveFrom && fmtDate(plan.effectiveFrom, locale) ? t("subq.plan.since", { date: fmtDate(plan.effectiveFrom, locale) }) : "",
  ].filter(Boolean).join(" · ");
  return line ? <Text variant="caption" tone="gray">{line}</Text> : null;
}
