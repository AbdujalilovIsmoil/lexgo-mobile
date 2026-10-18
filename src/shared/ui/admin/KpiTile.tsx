import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Card } from "../Card";
import { Icon, type IconName } from "../Icon";
import { Skeleton } from "../Skeleton";
import { Text } from "../Text";

type Props = { label: string; value: string; hint?: string; delta?: number; icon?: IconName; tint?: string; loading?: boolean; onPress?: () => void };

// KPI tile: icon, label, big value, optional ±% change and hint. Tappable for a drill-down.
export function KpiTile({ label, value, hint, delta, icon, tint, loading, onPress }: Props) {
  const c = useColors();
  const accent = tint ?? c.accent;
  const up = (delta ?? 0) >= 0;
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={s.head}>
        {icon ? <View style={[s.icon, { backgroundColor: `${accent}22` }]}><Icon name={icon} size={16} color={accent} /></View> : null}
        <Text variant="caption" tone="gray" numberOfLines={2} style={s.label}>{label}</Text>
      </View>
      {loading ? <Skeleton height={26} width="60%" /> : <Text variant="h3" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>}
      {delta !== undefined && !loading ? <Text variant="caption" weight="bold" style={{ color: up ? c.ok : c.err }}>{up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</Text> : hint ? <Text variant="caption" tone="gray2" numberOfLines={1}>{hint}</Text> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 6, flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 28, height: 28, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
});
