import { StyleSheet, View } from "react-native";
import { Card, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; tint: string; value: string; label: string; hint?: string; alert?: boolean; onPress?: () => void };

// Coloured counter tile: tinted icon disc, big value, label and an optional red hint.
export function StatTile({ icon, tint, value, label, hint, alert, onPress }: Props) {
  const c = useColors();
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={[s.ico, { backgroundColor: `${tint}26` }]}><Icon name={icon} size={18} color={tint} /></View>
      <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit style={{ color: alert ? c.err : c.ink }}>{value}</Text>
      <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
      {hint ? <Text variant="caption" weight="semibold" style={{ color: c.err }} numberOfLines={1}>{hint}</Text> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, padding: 14, gap: 4, minHeight: 112 },
  ico: { width: 36, height: 36, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 4 },
});
