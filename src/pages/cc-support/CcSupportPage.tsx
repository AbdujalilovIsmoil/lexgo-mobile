import { useState } from "react";
import { View } from "react-native";
import { TABS, useQueueCounts, type SupportTab } from "@/entities/admin-support";
import { useSupportLive } from "@/features/admin-support";
import { SupportQueue } from "@/widgets/admin-support";
import { CcToolsButton } from "@/widgets/cc-tools";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { ChipBar } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Support tab: the operator queue (new, mine, transferred, closed) with realtime arrival; a row opens the ticket
// workspace (/cc/assist/<id>): chat, call and acting on the client's behalf. New tickets also toast anywhere (CcMounts).
export function CcSupportPage() {
  const { t } = useT();
  const pad = useTabPad();
  const [tab, setTab] = useState<SupportTab>("new");
  const counts = useQueueCounts();
  useSupportLive();
  const options = TABS.map((k) => ({ value: k, label: t(`admSup.tabs.${k}`), count: counts[k] }));
  const header = (
    <View style={{ gap: 6, paddingBottom: 12 }}>
      <View style={{ marginHorizontal: -16 }}><ChipBar options={options} value={tab} onChange={setTab} /></View>
      {tab === "new" ? <Text variant="caption" tone="gray2">{t("admSup.oldestFirst")}</Text> : null}
    </View>
  );
  return (
    <TabPage title={t("tabs.support")} subtitle={t("cc1.support.sub")} right={<CcToolsButton />}>
      <SupportQueue tab={tab} header={header} bottomPad={pad} />
    </TabPage>
  );
}
