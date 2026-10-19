import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { Icon } from "../Icon";
import { Text } from "../Text";

// A file the app refuses to open or forward (executable, script, double extension, type mismatch…). No "open with" button on purpose.
export function BlockedView({ name }: { name: string }) {
  const { t } = useT();
  return (
    <View style={{ flex: 1, padding: 28, gap: 12, alignItems: "center", justifyContent: "center" }}>
      <Icon name="shield-off" size={48} tone="gray" />
      <Text variant="h4" center numberOfLines={2}>{name}</Text>
      <Text center>{t("fnd1.preview.blocked")}</Text>
      <Text tone="gray" center>{t("fnd1.preview.blockedHint")}</Text>
    </View>
  );
}
