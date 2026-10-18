import { useState } from "react";
import { View } from "react-native";
import { HistoryTab, ProtectionTab, SessionsTab } from "@/widgets/security";
import { Segmented } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Tab = "protect" | "sessions" | "history";

// Account security for every signed-in role: 2FA, Telegram link, notification preferences,
// signed-in devices and the audit log. Reached from the Profile menu (/security).
export default function SecurityPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("protect");
  const options = [
    { value: "protect" as const, label: t("admSec.tabProtect") },
    { value: "sessions" as const, label: t("admSec.tabSessions") },
    { value: "history" as const, label: t("admSec.tabHistory") },
  ];
  return (
    <AdminPage title={t("admSec.title")}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Segmented options={options} value={tab} onChange={setTab} />
      </View>
      {tab === "protect" ? <ProtectionTab /> : tab === "sessions" ? <SessionsTab /> : <HistoryTab />}
    </AdminPage>
  );
}
