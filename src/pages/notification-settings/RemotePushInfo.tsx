import { View } from "react-native";
import { PUSH_TOKEN_ENABLED, PUSH_TOKEN_PATH } from "@/shared/config/infra";
import { useT } from "@/shared/i18n";
import { Pill, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

// Honest status of remote push: the backend has no device-token endpoint yet, so alerts come from the
// live connection and the periodic check (the whole app depends on neither Firebase nor APNs).
export function RemotePushInfo() {
  const { t } = useT();
  const state = !PUSH_TOKEN_ENABLED ? "off" : PUSH_TOKEN_PATH ? "on" : "wait";
  return (
    <SectionCard title={t("nt2.remote.title")}>
      <View style={{ flexDirection: "row" }}><Pill label={t(`nt2.remote.${state}`)} tone={state === "on" ? "ok" : "gray"} small /></View>
      <Text variant="small" tone="gray">{t("nt2.remote.text")}</Text>
    </SectionCard>
  );
}
