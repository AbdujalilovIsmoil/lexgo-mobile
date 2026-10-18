import type { ReactNode } from "react";
import { HrmStatus, entryLabel, fmtMinutes, stLabel, type Employee360 } from "@/entities/admin-hrm";
import { FactRows, KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

export type Tab360 = "info" | "work" | "time" | "money";

// One tab of the 360 view: counters (info), latest tasks (work), attendance days (time) or KPIs and payroll (money).
export function Employee360Lists({ data, tab }: { data: Employee360; tab: Tab360 }) {
  const { t, locale } = useT();
  const block = (title: string, rows: { label: string; value: ReactNode }[]) =>
    rows.length ? <SectionCard key={title} title={title}><FactRows rows={rows} /></SectionCard> : null;
  const kpis = block(t("admHrm.nav.kpi"), data.kpis.slice(0, 6).map((x) => ({ label: x.title, value: <Text variant="small" weight="bold">{Math.round(x.score)}</Text> })));
  const pay = block(t("admHrm.nav.payroll"), data.payroll.slice(0, 6).map((x) => ({ label: `${x.period} · ${entryLabel(t, x.type)}`, value: `${fmtMoney(x.amount)} ${t("adm.currency")}` })));
  const body = {
    info: (
      <KpiGrid>
        <KpiTile icon="check-square" tint="#F59E0B" label={t("admHrmB.tasksCount")} value={String(data.tasks.length)} />
        <KpiTile icon="calendar" tint="#22C55E" label={t("admHrmB.attCount")} value={String(data.attendance.length)} />
        <KpiTile icon="target" tint="#EF4444" label={t("admHrmB.kpiCount")} value={String(data.kpis.length)} />
        <KpiTile icon="credit-card" tint="#6366F1" label={t("admHrmB.payCount")} value={String(data.payroll.length)} />
      </KpiGrid>
    ),
    work: block(t("admHrm.nav.tasks"), data.tasks.slice(0, 8).map((x) => ({ label: x.title, value: <HrmStatus status={x.status} /> }))),
    time: block(t("admHrm.nav.attendance"), data.attendance.slice(0, 8).map((x) => ({ label: fmtDate(x.date, locale), value: `${fmtMinutes(x.worked, t)} · ${stLabel(t, x.status)}` }))),
    money: kpis || pay ? <>{kpis}{pay}</> : null,
  }[tab];
  return body ?? <Text variant="small" tone="gray" center>{t("admHrmU.nothing")}</Text>;
}
