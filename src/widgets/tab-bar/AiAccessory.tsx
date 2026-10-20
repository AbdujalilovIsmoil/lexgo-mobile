import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { AiOrb, Icon, PressableScale, Text } from "@/shared/ui";

// The strip the system floats above the tab bar (iOS 26): the living AI orb and a line, one tap opens the assistant. When the bar
// shrinks on scroll the system asks for the `inline` placement, which keeps the orb alone.
export function AiAccessory() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const inline = NativeTabs.BottomAccessory.usePlacement() === "inline";
  return (
    <PressableScale onPress={() => router.navigate("/(tabs)/ai" as never)} style={s.row} accessibilityRole="button" accessibilityLabel={t("ax2.hint")}>
      <AiOrb size={inline ? 26 : 30} />
      {inline ? null : (
        <>
          <Text variant="small" weight="semibold" numberOfLines={1} style={s.text}>{t("ax2.hint")}</Text>
          <View pointerEvents="none"><Icon name="chevron-right" size={18} color={c.gray} /></View>
        </>
      )}
    </PressableScale>
  );
}

const s = StyleSheet.create({ row: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 16 }, text: { flexShrink: 1 } });
