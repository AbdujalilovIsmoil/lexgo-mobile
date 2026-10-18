import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { GradientBox } from "@/shared/ui";
import type { Placement } from "../model/types";

// Tiny schematic of the marketplace page with the promoted spot in gold (mirrors the web's mini previews).
// `tall` draws it larger, as the picture of a full-width card.
export function PlacementArt({ kind, tall }: { kind: Placement; tall?: boolean }) {
  const c = useColors();
  const k = tall ? 1.6 : 1;
  const cell = (flex = 1, gold = false, h = 12) => <View style={[s.cell, { flex, height: h * k, backgroundColor: gold ? c.warn : c.surface2 }]} />;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.frame, { backgroundColor: c.bg, borderColor: c.line }]}>
      {kind === "banner" ? (
        <>
          <GradientBox variant="dark" round={6} style={[s.hero, { height: 30 * k }]}><View style={[s.gold, { backgroundColor: c.warn, height: 18 * k }]} /></GradientBox>
          <View style={s.row}>{cell()}{cell()}{cell()}</View>
        </>
      ) : kind === "profile_boost" ? (
        <>
          <View style={s.row}>{cell(1, true)}{cell()}{cell()}</View>
          <View style={s.row}>{cell()}{cell()}{cell()}</View>
        </>
      ) : (
        <>
          <View style={s.row}>{cell(1, true)}{cell()}{cell()}{cell()}</View>
          <View style={s.row}>{cell(1, false, 18)}{cell(1, false, 18)}{cell(1, false, 18)}</View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  frame: { borderWidth: 1, borderRadius: radius.sm, padding: 6, gap: 5 },
  row: { flexDirection: "row", gap: 5 },
  cell: { borderRadius: 4 },
  hero: { borderRadius: 6, alignItems: "flex-end", justifyContent: "center", paddingRight: 8 },
  gold: { width: 12, borderRadius: 4 },
});
