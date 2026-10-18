import { ActivityIndicator, StyleSheet } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; label: string; onPress: () => void; disabled?: boolean; loading?: boolean };

// One way to attach something: a tall tile with the icon over its name (file, photo, voice note).
export function AttachTile({ icon, label, onPress, disabled, loading }: Props) {
  const c = useColors();
  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} accessibilityRole="button" accessibilityLabel={label} style={[s.tile, { backgroundColor: c.surface2, borderColor: c.line, opacity: disabled ? 0.5 : 1 }]}>
      {loading ? <ActivityIndicator size="small" color={c.accent} /> : <Icon name={icon} size={22} color={c.accent} />}
      <Text variant="caption" weight="semibold" numberOfLines={1}>{label}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({ tile: { flex: 1, minHeight: 78, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 18, borderWidth: 1, paddingHorizontal: 6 } });
