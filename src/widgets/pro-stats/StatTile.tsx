import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Card, Icon, Skeleton, Text, type IconName } from "@/shared/ui";
import { useTileWidth } from "./Block";

export type TileTone = "blue" | "ok" | "warn" | "err" | "cy";

export function useTone(tone: TileTone): { fg: string; bg: string } {
  const c = useColors();
  return { blue: { fg: c.accentStrong, bg: c.tint2 }, ok: { fg: c.ok, bg: c.okBg }, warn: { fg: c.warn, bg: c.warnBg }, err: { fg: c.err, bg: c.errBg }, cy: { fg: c.cyText, bg: c.cyBg } }[tone];
}

export const TILE_HEIGHT = 140;

type Props = { icon: IconName; tone: TileTone; label: string; value: string; unit?: string };

// One KPI: icon tile, big number (with a reserved unit line), short label. Every tile has the SAME fixed width (half the row) and
// height, whatever it holds: no tile is ever taller or wider than another. The whole tile reads "label: value".
export function StatTile({ icon, tone, label, value, unit }: Props) {
  const { fg, bg } = useTone(tone);
  const unknown = value === "—";
  const width = useTileWidth();
  return (
    <Card style={[s.card, { width }]} accessible accessibilityLabel={`${label}: ${unknown ? "—" : unit ? `${value} ${unit}` : value}`}>
      <View style={[s.icon, { backgroundColor: bg }]}><Icon name={icon} size={18} color={fg} /></View>
      <View style={s.body}>
        <Text variant="h3" numberOfLines={1} adjustsFontSizeToFit tone={unknown ? "gray2" : "ink"}>{value}</Text>
        {unit && !unknown ? <Text variant="caption" tone="gray" numberOfLines={1}>{unit}</Text> : null}
      </View>
      <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
    </Card>
  );
}

export function StatTileSkeleton() {
  const width = useTileWidth();
  return (
    <Card style={[s.card, { width }]}>
      <Skeleton width={36} height={36} round={radius.sm} />
      <Skeleton width="55%" height={24} />
      <Skeleton width="75%" height={12} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { height: TILE_HEIGHT, padding: 14, gap: 10, justifyContent: "space-between" },
  icon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  body: { gap: 0, minHeight: 40 }, // number + unit line: reserved even when there is no unit
});
