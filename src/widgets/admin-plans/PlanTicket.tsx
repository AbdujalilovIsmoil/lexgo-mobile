import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { planAudience, planPrice, primaryPeriod, type Plan } from "@/entities/admin-plans";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { usePlanActions } from "./usePlanActions";

type Props = { plan: Plan; acts: ReturnType<typeof usePlanActions>; onEdit: () => void };

// A tariff as a ticket: strip (green active / grey off), price badge, audience chips and round buttons (edit, on/off, restore, reset, delete).
export function PlanTicket({ plan: p, acts, onEdit }: Props) {
  const { t } = useT();
  const c = useColors();
  const period = primaryPeriod(p);
  const price = planPrice(p, period);
  return (
    <CcTicket
      tint={p.hidden ? c.gray2 : p.isActive ? c.ok : c.warn} icon="star" title={p.name || p.title} subtitle={p.slug} onPress={onEdit}
      badge={<Pill small tone="gray" label={price ? `${fmtMoney(price)} ${t("adm.currency")}${period === "monthly" ? "" : ` · ${t(`admPlans.periods.${period}`)}`}` : "—"} />}
      chips={<>
        {planAudience(p).map((a) => <Pill key={a} small tone="blue" label={t(`admPlans.audiences.${a}`)} />)}
        {p.isGiftable ? <Pill small tone="cy" label={t("admPlans.giftable")} /> : null}
        {p.overridden ? <Pill small tone="warn" label={t("admPlans.overridden")} /> : null}
        {p.hidden ? <Pill small tone="gray" label={t("admPlans.hiddenTag")} /> : null}
      </>}
      actions={<>
        {p.overridden ? <CcAction icon="refresh-cw" label={t("admPlans.reset")} onPress={() => acts.reset(p)} loading={acts.busy} /> : null}
        {p.hidden ? <CcAction icon="eye" label={t("admPlans.restore")} onPress={() => acts.restore(p)} loading={acts.busy} /> : <CcAction icon={p.isActive ? "eye-off" : "eye"} label={p.isActive ? t("admPlans.deactivate") : t("admPlans.activate")} onPress={() => acts.toggle(p)} />}
        {p.hidden ? null : <CcAction icon="trash-2" label={t("adm.delete")} onPress={() => acts.remove(p)} />}
        <CcAction primary icon="edit-2" label={t("admPlansB.edit")} onPress={onEdit} />
      </>}
    />
  );
}
