import { ActivityIndicator, StyleSheet } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; label: string; tone: "ok" | "err"; busy: boolean; disabled: boolean; onPress: () => void };

// One answer to "was it useful?": a 48 pt tile with a thumb; it shows a spinner while the vote is on its way.
export function FeedbackChoice({ icon, label, tone, busy, disabled, onPress }: Props) {
  const c = useColors();
  const fg = tone === "ok" ? c.ok : c.err;
  return (
    <PressableScale onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} style={[s.tile, { backgroundColor: c.glassFill, borderColor: c.glassLine, opacity: disabled && !busy ? 0.55 : 1 }]}>
      {busy ? <ActivityIndicator size="small" color={fg} /> : <Icon name={icon} size={18} color={fg} />}
      <Text variant="small" weight="semibold">{label}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  tile: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1.5 },
});
