import { useState } from "react";
import { View } from "react-native";
import { AdminPage, ChipBar } from "@/shared/ui/admin";
import { StudioGate } from "@/entities/admin-studio";
import { AccessPanel, ExportPanel, RegistryPanel, ReleasesPanel, RoutesPanel, RuntimePanel, StudioNav } from "@/widgets/admin-studio";
import { useT } from "@/shared/i18n";

type Tab = "access" | "routes" | "releases" | "runtime" | "registry" | "export";
const TABS: Tab[] = ["access", "routes", "releases", "runtime", "registry", "export"];

function Settings() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("access");
  const bar = <View style={{ marginHorizontal: -16 }}><ChipBar value={tab} onChange={setTab} options={TABS.map((k) => ({ value: k, label: k === "releases" || k === "runtime" ? t(`ag9.tab.${k}`) : t(`admStudioC.tabs.${k}`) }))} /></View>;
  return (
    <AdminPage title={t("admStudioC.settingsTitle")} subtitle={t("admStudioC.settingsLead")}>
      <StudioNav current="settings" />
      {tab === "access" ? <AccessPanel bar={bar} /> : tab === "routes" ? <RoutesPanel bar={bar} /> : tab === "releases" ? <ReleasesPanel bar={bar} /> : tab === "runtime" ? <RuntimePanel bar={bar} /> : tab === "registry" ? <RegistryPanel bar={bar} /> : <ExportPanel bar={bar} />}
    </AdminPage>
  );
}

// Settings (admin): who has studio access, approval routes, the constructor registry, Excel exports.
export default function StudioSettingsPage() {
  const { t } = useT();
  return <StudioGate need="admin" title={t("admStudioC.settingsTitle")}><Settings /></StudioGate>;
}
