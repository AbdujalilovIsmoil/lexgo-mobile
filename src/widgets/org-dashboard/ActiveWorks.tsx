import { useState } from "react";
import { View } from "react-native";
import { Button, Segmented, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { WorkRow, type Dashboard, type WorkItem } from "@/entities/organization";

type Tab = "orders" | "cases" | "urgent";
type Props = { dash: Dashboard; names: Map<string, string>; onOpen: (w: WorkItem) => void; onAll: () => void };

// Active orders / cases / urgent requests of all members, newest first; "all" opens the full workload.
export function ActiveWorks({ dash, names, onOpen, onAll }: Props) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("orders");
  const lists: Record<Tab, WorkItem[]> = { orders: dash.orders, cases: dash.cases, urgent: dash.urgent };
  const rows = [...lists[tab]].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  return (
    <SectionCard title={t("og2.activeWorks")}>
      <Segmented options={(["orders", "cases", "urgent"] as Tab[]).map((k) => ({ value: k, label: `${t(`og2.${k}`)} ${lists[k].length}` }))} value={tab} onChange={setTab} />
      <View style={{ gap: 10 }}>
        {rows.length ? rows.map((w) => <WorkRow key={`${w.kind}-${w.id}`} item={w} memberName={names.get(w.memberUserId)} onPress={() => onOpen(w)} />) : <Text variant="small" tone="gray" center>{t("og2.noWorks")}</Text>}
      </View>
      <Button title={t("og2.allWorkload")} variant="soft" icon="list" full onPress={onAll} />
    </SectionCard>
  );
}
