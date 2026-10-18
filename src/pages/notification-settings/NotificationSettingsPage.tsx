import { ScrollView, View } from "react-native";
import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { PushPermissionCard } from "@/widgets/push-permission";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { AdminPage } from "@/shared/ui/admin";
import { DevicePrefs } from "./DevicePrefs";
import { RemotePushInfo } from "./RemotePushInfo";
import { ServerPrefs } from "./ServerPrefs";

// /settings/notifications: permission, server-side channel/topic switches, on-device alert settings.
export function NotificationSettingsPage() {
  const { t } = useT();
  const insets = useInsets();
  if (!useIsAuthed()) return <Redirect href="/auth/login" />;
  return (
    <AdminPage title={t("nt2.title")} subtitle={t("nt2.subtitle")}>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <PushPermissionCard always />
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          <ServerPrefs />
          <DevicePrefs />
          <RemotePushInfo />
        </View>
      </ScrollView>
    </AdminPage>
  );
}
