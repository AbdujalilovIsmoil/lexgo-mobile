import { useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import type { ModuleGroup } from "@/widgets/admin-drawer";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGrid } from "@/shared/lib/useGrid";
import { ModuleTile } from "./ModuleTile";

const GAP = 10;

// A group of sections: a tappable header (collapses the group) and a 3-column grid of tiles.
export function GroupSection({ group, offset }: { group: ModuleGroup; offset: number }) {
  const { t } = useT();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(true);
  const grid = useGrid({ gap: GAP, min: 150, minCols: 3 });
  const tile = grid.cell?.width ?? Math.floor((width - 32 - GAP * 2) / 3);
  return (
    <View style={s.wrap}>
      <PressableScale onPress={() => setOpen((v) => !v)} scale={0.98} style={s.head} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text variant="kicker" tone="gray2" style={s.fill}>{t(`admHub.groups.${group.key}`).toUpperCase()} · {group.mods.length}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} tone="gray" />
      </PressableScale>
      {open ? <View style={s.grid} onLayout={grid.onLayout}>{grid.ready ? group.mods.map((m, i) => <ModuleTile key={m.key} mod={m} index={offset + i} width={tile} move={grid.move} />) : null}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({ wrap: { paddingHorizontal: 16, gap: 10 }, head: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingVertical: 4 }, fill: { flex: 1 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP } });
