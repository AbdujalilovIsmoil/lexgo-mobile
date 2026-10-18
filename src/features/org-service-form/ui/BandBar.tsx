import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import type { PriceBand } from "@/entities/organization";

// The allowed price range as a highlighted stretch of a track, with a dot where the typed price lies.
export function BandBar({ band, price, off }: { band: PriceBand; price: number; off: boolean }) {
  const c = useColors();
  const lo = band.min * 0.86;
  const hi = band.max * 1.1;
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo || 1)) * 100))}%` as `${number}%`;
  return (
    <View style={s.wrap}>
      <View style={[s.track, { backgroundColor: c.surface2 }]}>
        <View style={[s.range, { left: pos(band.min), width: `${((band.max - band.min) / (hi - lo || 1)) * 100}%` as `${number}%`, backgroundColor: c.okBg, borderColor: c.ok }]} />
        {price > 0 ? <View style={[s.dot, { left: pos(price), backgroundColor: off ? c.err : c.accent }]} /> : null}
      </View>
      <View style={s.labels}>
        <Text variant="caption" tone="gray">{fmtMoney(band.min)}</Text>
        <Text variant="caption" tone="gray">{fmtMoney(band.max)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 4 },
  track: { height: 10, borderRadius: 5, justifyContent: "center" },
  range: { position: "absolute", height: 10, borderRadius: 5, borderWidth: 1.5 },
  dot: { position: "absolute", width: 16, height: 16, borderRadius: 8, marginLeft: -8, borderWidth: 2, borderColor: "#fff" },
  labels: { flexDirection: "row", justifyContent: "space-between" },
});
