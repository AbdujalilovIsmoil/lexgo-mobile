import { useState } from "react";
import { View } from "react-native";
import { TABS, useQueueCounts, type SupportTab } from "@/entities/admin-support";
import { useSupportLive } from "@/features/admin-support";
import { SupportHero, SupportQueue } from "@/widgets/admin-support";
import { AdminPage, SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Operator queue: hero numbers, queue tiles with counts (waiting in red), search, ticket cards. Refreshes itself every 10 s.
export default function AdminSupportPage() {
  const { t } = useT();
  const [tab, setTab] = useState<SupportTab>("new");
  const [q, setQ] = useState("");
  const counts = useQueueCounts();
  useSupportLive();
  const options = TABS.map((k) => ({ value: k, label: t(`admSup.tabs.${k}`), count: counts[k], alert: k === "new" }));
  const header = (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <SupportHero counts={counts} />
      <View style={{ marginHorizontal: -16, gap: 10 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("admSup.hero.search")} /><CcTiles options={options} value={tab} onChange={(v) => setTab(v as SupportTab)} /></View>
      {tab === "new" ? <Text variant="caption" tone="gray2">{t("admSup.oldestFirst")}</Text> : null}
    </View>
  );
  return (
    <AdminPage title={t("admHub.mod.support.title")} subtitle={t("admSup.lead")}>
      <SupportQueue tab={tab} header={header} search={q} />
    </AdminPage>
  );
}
