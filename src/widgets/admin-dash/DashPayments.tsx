import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { Pill, Text } from "@/shared/ui";
import { BarList, KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import type { DashCtx } from "./lib/useDashCtx";
import { drillPayments } from "./drills/money";
import { drillLeads, drillOrders } from "./drills/people";

// Paid / pending money, leads by score and orders by status (all from GET /admin/dashboard).
export function DashPayments({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, label } = x;
  const go = (f: (x: DashCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  const hint = (k: string) => `${fmt.int(x.stat(`${k}_count`) ?? 0)} ${t(k === "paid" ? "admDashC.crm.paidCount" : "admDashC.crm.pendingCount").toLowerCase()}`;
  if (!x.d) return null;
  return (
    <>
      <SectionCard title={t("admDashC.crm.payments")}>
        <KpiGrid>
          <KpiTile icon="check-circle" tint="#22C55E" label={t("admDashC.crm.paidAmount")} value={fmt.short(x.stat("paid_amount"))} hint={hint("paid")} onPress={go((c) => drillPayments(c, "paid"))} />
          <KpiTile icon="clock" tint="#F59E0B" label={t("admDashC.crm.pendingAmount")} value={fmt.short(x.stat("pending_amount"))} hint={hint("pending")} onPress={go((c) => drillPayments(c, "pending"))} />
        </KpiGrid>
      </SectionCard>
      {x.byScore.length ? (
        <SectionCard title={t("admDashC.crm.leadsByScore")} action={{ label: t("admDashB.drill.details"), onPress: go(drillLeads) }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {x.byScore.map((p) => <Pill key={p.label} label={`${label.score(p.label)} · ${fmt.int(p.value)}`} tone={p.label === "hot" ? "err" : p.label === "warm" ? "warn" : "blue"} />)}
          </View>
        </SectionCard>
      ) : null}
      <SectionCard title={t("admDashC.crm.ordersByStatus")} action={{ label: t("admDashB.drill.details"), onPress: go(drillOrders) }}>
        {x.byStatus.length ? <BarList items={x.byStatus.map((p) => ({ label: label.status(p.label), value: p.value }))} format={fmt.int} /> : <Text variant="small" tone="gray">{t("admDash.empty")}</Text>}
      </SectionCard>
    </>
  );
}
