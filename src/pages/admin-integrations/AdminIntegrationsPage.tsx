import { useState } from "react";
import { View } from "react-native";
import { ExportButton } from "@/features/admin-export";
import { AiStatusView, ReadinessView } from "@/widgets/admin-system";
import { AdminPage } from "@/shared/ui/admin";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ServicesTab } from "./ServicesTab";
import { TabScroll } from "./TabScroll";

type Tab = "services" | "ready" | "ai";

// System health: third-party integrations + data residency, end-to-end readiness of the platform flows, and the AI assistant.
export default function AdminIntegrationsPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("services");
  const tabs = (["services", "ready", "ai"] as const).map((k) => ({ value: k, label: t(`ag7.tab.${k}`) }));
  return (
    <AdminPage title={t("admHub.mod.integrations.title")} subtitle={t("admInt.lead")} right={<ExportButton id="system" />}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Segmented options={tabs} value={tab} onChange={setTab} /></View>
      {tab === "services" ? <ServicesTab /> : null}
      {tab === "ready" ? <TabScroll><ReadinessView /></TabScroll> : null}
      {tab === "ai" ? <TabScroll><AiStatusView /></TabScroll> : null}
    </AdminPage>
  );
}
