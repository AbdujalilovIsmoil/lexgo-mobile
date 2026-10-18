import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import type { OrgNode } from "@/entities/admin-hrm";
import { EmptyState } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ChartControls } from "./ChartControls";
import { ChartNode } from "./ChartNode";
import { layoutTree } from "./layoutTree";
import { useChartGestures } from "./useChartGestures";

type Props = { nodes: OrgNode[]; onSelect: (n: OrgNode) => void };

// The organisation as a tree you can pan with one finger, pinch with two, double-tap to fit; tap a unit for its detail sheet.
export function OrgChart({ nodes, onSelect }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [box, setBox] = useState({ w: 0, h: 0 });
  const lay = useMemo(() => layoutTree(nodes), [nodes]);
  const g = useChartGestures(lay.width, lay.height, box.w, box.h);
  const { fitTo } = g;
  // Re-fit whenever the viewport or the tree changes size.
  useEffect(() => {
    if (box.w > 0 && box.h > 0) fitTo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.w, box.h, lay.width, lay.height]);
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  if (!lay.placed.length) return <EmptyState icon="layers" title={t("admHrmB.emptyUnits")} />;
  return (
    <View style={s.fill} onLayout={onLayout}>
      <GestureDetector gesture={g.gesture}>
        <View style={[s.fill, s.clip, { backgroundColor: c.surface2 }]} collapsable={false}>
          <Animated.View style={[{ width: lay.width, height: lay.height }, g.style]}>
            {lay.bars.map((b, i) => <View key={i} style={[s.bar, { left: b.x, top: b.y, width: b.w, height: b.h, backgroundColor: c.line }]} />)}
            {lay.placed.map((p) => <ChartNode key={p.node.id} item={p} onSelect={onSelect} />)}
          </Animated.View>
        </View>
      </GestureDetector>
      <ChartControls onIn={() => g.zoomBy(1.3)} onOut={() => g.zoomBy(1 / 1.3)} onFit={g.fitTo} bottom={insets.bottom + 16} />
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, clip: { overflow: "hidden", borderRadius: 18, marginHorizontal: 12 }, bar: { position: "absolute", borderRadius: 1 } });
