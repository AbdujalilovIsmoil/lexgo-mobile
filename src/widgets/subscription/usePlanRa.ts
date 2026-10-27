import type { Plan } from "@/entities/plan";
import { RA_FINAL, RA_VIEW, useRaControl } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";

export const planRaId = (p: Plan): string => `subscription.plan.${(p.slug || p.id).toLowerCase().replace(/[^a-z0-9-]+/g, "-")}`;

// A tariff card and its choose button on the remote-assistance map. The operator may point at them and show the button to the client
// (confirmation.present), never press it: choosing and paying stay the client's own taps.
export function usePlanRa(plan: Plan, current: boolean, closed: boolean) {
  const { t } = useT();
  const id = planRaId(plan);
  const card = useRaControl({ id, label: t("ra.el.plan", { name: plan.name }), actions: RA_VIEW, state: current ? "selected" : "ready" });
  const choose = useRaControl({ id: `${id}.choose`, label: t("ra.el.choose", { name: plan.name }), actions: RA_FINAL, state: current || closed ? "disabled" : "ready" });
  return { card, choose };
}
