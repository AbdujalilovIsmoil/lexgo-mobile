import { View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Said before the form is filled, not after the backend refuses it (the 402 gate is the fallback).
export function PriorNote() {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.warnBg }}>
      <Icon name="lock" size={16} color={c.warn} />
      <Text variant="small" style={{ flex: 1, color: c.warn }}>{t("ug2.priorNote")}</Text>
    </View>
  );
}
