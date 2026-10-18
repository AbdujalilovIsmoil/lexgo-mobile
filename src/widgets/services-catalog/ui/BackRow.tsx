import { StyleSheet } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// One step up the drill-down: subcategory -> category -> areas.
export function BackRow({ onPress }: { onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <PressableScale onPress={onPress} hitSlop={8} style={[s.row, { backgroundColor: c.tint2 }]}>
      <Icon name="chevron-left" size={16} tone="accent" />
      <Text variant="small" weight="bold" tone="accent">{t("csv.back")}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 2, alignSelf: "flex-start", paddingVertical: 7, paddingLeft: 8, paddingRight: 14, borderRadius: 999 } });
