import { StyleSheet } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

// Sticky bottom bar of the inbox: a fake input that opens the composer.
export function ComposeBar({ onPress }: { onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <PressableScale onPress={() => { tapHaptic(); onPress(); }} accessibilityRole="button" accessibilityLabel={t("admHrm.newMessage")} style={[s.bar, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <Icon name="edit-3" size={18} color={c.accent} />
      <Text variant="body" tone="gray" style={{ flex: 1 }} numberOfLines={1}>{t("admHrmW.composeHint")}</Text>
      <Icon name="send" size={18} color={c.accent} />
    </PressableScale>
  );
}

const s = StyleSheet.create({ bar: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1.5 } });
