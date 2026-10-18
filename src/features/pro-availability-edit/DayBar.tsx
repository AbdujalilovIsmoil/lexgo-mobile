import { StyleSheet, View } from "react-native";
import { barGeometry } from "@/entities/pro-availability";
import { radius, useColors } from "@/shared/theme";

// 24 h strip under an open day: the working range is filled, ticks sit at 06 / 12 / 18.
export function DayBar({ start, end }: { start: string; end: string }) {
  const c = useColors();
  const g = barGeometry(start, end);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.track, { backgroundColor: c.surface2 }]}>
      {g ? <View style={[s.fill, { backgroundColor: c.accent, left: `${g.left * 100}%`, width: `${g.width * 100}%` }]} /> : null}
      {[0.25, 0.5, 0.75].map((x) => <View key={x} style={[s.tick, { left: `${x * 100}%`, backgroundColor: c.line }]} />)}
    </View>
  );
}

const s = StyleSheet.create({
  track: { height: 8, borderRadius: radius.pill, overflow: "hidden" },
  fill: { position: "absolute", top: 0, bottom: 0, borderRadius: radius.pill },
  tick: { position: "absolute", top: 0, bottom: 0, width: 1 },
});
