import { useState } from "react";
import { View } from "react-native";
import { SheetBack, Segmented, Text } from "@/shared/ui";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { WorkFacts, WorkRow, WorkloadChips, type Dashboard, type OrgMember, type OwnerStats, type WorkItem } from "@/entities/organization";

type Props = { member: OrgMember | null; dash: Dashboard; stats: OwnerStats | undefined; onOpen: (m: OrgMember) => void; onClose: () => void };
type Tab = "orders" | "cases" | "urgent";

// What one member works on right now (from the owner dashboard) and what they have finished.
export function MemberWorkSheet({ member: current, dash, stats, onOpen, onClose }: Props) {
  const { t } = useT();
  const m = useKept(current);
  const [tab, setTab] = useState<Tab>("orders");
  const [detail, setDetail] = useState<WorkItem | null>(null);
  const mine = (list: WorkItem[]) => list.filter((w) => w.memberUserId === m?.userId);
  const lists: Record<Tab, WorkItem[]> = { orders: mine(dash.orders), cases: mine(dash.cases), urgent: mine(dash.urgent) };
  const st = m ? stats?.byMember[m.userId] : undefined;
  const close = () => {
    setDetail(null);
    onClose();
  };
  return (
    <FormSheet visible={!!current} onClose={close} title={m?.name ?? ""} subtitle={m?.title} onSubmit={m && !detail ? () => { close(); onOpen(m); } : undefined} submitLabel={t("og2.openMember")} snaps={[0.7, 0.94]}>
      {detail ? <SheetBack onPress={() => setDetail(null)} /> : null}
      {detail ? <WorkFacts item={detail} memberName={m?.name} /> : m ? (
        <View style={{ gap: 14 }}>
          <WorkloadChips w={m.workload} />
          <FactRows rows={[{ label: t("og2.kpi.completed"), value: st ? String(st.completed) : "" }, { label: t("og2.kpi.revenue"), value: st?.revenue ? `${fmtMoney(st.revenue)} ${t("adm.currency")}` : "" }]} />
          <Segmented options={(["orders", "cases", "urgent"] as Tab[]).map((k) => ({ value: k, label: `${t(`og2.${k}`)} ${lists[k].length}` }))} value={tab} onChange={setTab} />
          {lists[tab].length ? lists[tab].map((w) => <WorkRow key={w.id} item={w} onPress={() => setDetail(w)} />) : <Text variant="small" tone="gray" center>{t("og2.noWorks")}</Text>}
        </View>
      ) : null}
    </FormSheet>
  );
}
