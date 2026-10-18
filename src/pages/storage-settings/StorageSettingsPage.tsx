import { ScrollView, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { AdminPage } from "@/shared/ui/admin";
import { ClearCard } from "./ClearCard";
import { ConnectionCard } from "./ConnectionCard";
import { DiagnosticsCard } from "./DiagnosticsCard";
import { OutboxCard } from "./OutboxCard";
import { SizeCard } from "./SizeCard";
import { useStorageInfo } from "./useStorageInfo";

// /settings/storage: what the app keeps on the phone, how to free it, unsent offline writes, link status.
export function StorageSettingsPage() {
  const { t } = useT();
  const insets = useInsets();
  const info = useStorageInfo();
  return (
    <AdminPage title={t("nt3.title")} subtitle={t("nt3.subtitle")}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 14 }}>
          <SizeCard info={info} />
          <ClearCard />
          <OutboxCard />
          <ConnectionCard />
          <DiagnosticsCard />
        </View>
      </ScrollView>
    </AdminPage>
  );
}
