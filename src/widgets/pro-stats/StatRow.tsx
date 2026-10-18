import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Skeleton, Text, type IconName } from "@/shared/ui";

export type TileTone = "blue" | "ok" | "warn" | "err" | "cy";

export function useTone(tone: TileTone): { fg: string; bg: string } {
  const c = useColors();
  return { blue: { fg: c.accentStrong, bg: c.tint2 }, ok: { fg: c.ok, bg: c.okBg }, warn: { fg: c.warn, bg: c.warnBg }, err: { fg: c.err, bg: c.errBg }, cy: { fg: c.cyText, bg: c.cyBg } }[tone];
}

type Props = { icon: IconName; tone: TileTone; label: string; value: string; unit?: string; last?: boolean };

// One KPI as a row of a list card: a coloured icon tile and the name on the left, the number (with its unit) on the right, a hairline
// under it. Rows have one fixed height and stack, so nothing can be wider, taller or smaller than its neighbour. Reads "label: value".
export function StatRow({ icon, tone, label, value, unit, last }: Props) {
  const { fg, bg } = useTone(tone);
  const c = useColors();
  const unknown = value === "—";
  return (
    <View accessible accessibilityLabel={`${label}: ${unknown ? "—" : unit ? `${value} ${unit}` : value}`} style={[s.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
      <View style={[s.icon, { backgroundColor: bg }]}><Icon name={icon} size={19} color={fg} /></View>
      <Text variant="body" numberOfLines={2} style={s.label}>{label}</Text>
      <View style={s.value}>
        <Text variant="h4" numberOfLines={1} adjustsFontSizeToFit tone={unknown ? "gray2" : "ink"}>{value}</Text>
        {unit && !unknown ? <Text variant="caption" tone="gray" numberOfLines={1}>{unit}</Text> : null}
      </View>
    </View>
  );
}

export function StatRowSkeleton({ last }: { last?: boolean }) {
  const c = useColors();
  return (
    <View style={[s.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
      <Skeleton width={40} height={40} round={radius.sm} />
      <View style={s.label}><Skeleton width="60%" height={14} /></View>
      <Skeleton width={48} height={20} />
    </View>
  );
}

export const ROW_HEIGHT = 64;

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, height: ROW_HEIGHT, paddingHorizontal: 14 },
  icon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
  value: { alignItems: "flex-end", maxWidth: "45%", flexShrink: 0 },
});
