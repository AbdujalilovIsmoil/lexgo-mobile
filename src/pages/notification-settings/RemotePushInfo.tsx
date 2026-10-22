import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { usePermissionStore, useRemoteRegistered } from "@/shared/push";
import { Pill, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

// Honest status of remote push: "on" once the backend has this phone's token (alerts reach it even with the app closed), "wait" when the
// permission is given but no token was registered (no Firebase / APNs in this build, or no network yet), "off" without the permission.
export function RemotePushInfo() {
  const { t } = useT();
  const granted = usePermissionStore((s) => s.status === "granted");
  const registered = useRemoteRegistered((s) => s.on);
  const state = !granted ? "off" : registered ? "on" : "wait";
  return (
    <SectionCard title={t("nt2.remote.title")}>
      <View style={{ flexDirection: "row" }}><Pill label={t(`nt2.remote.${state}`)} tone={state === "on" ? "ok" : "gray"} small /></View>
      <Text variant="small" tone="gray">{t(`nt2.remote.text.${state}`)}</Text>
    </SectionCard>
  );
}
