import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { PressableScale } from "../PressableScale";
import { Icon } from "../Icon";
import { Text } from "../Text";

// "Back" for a view inside a sheet: a soft pill with a round chevron chip.
export function SheetBack({ onPress, label }: { onPress: () => void; label?: string }) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label ?? t("common.back")} hitSlop={8} style={[s.pill, { backgroundColor: c.tint2 }]}>
      <View style={[s.chip, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <Icon name="chevron-left" size={17} color={c.accent} />
      </View>
      <Text variant="small" weight="bold" style={{ color: c.accentStrong }}>{label ?? t("common.back")}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, paddingVertical: 4, paddingLeft: 4, paddingRight: 16, borderRadius: radius.pill },
  chip: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
