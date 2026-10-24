import { View, useWindowDimensions } from "react-native";
import { useAccess } from "@/entities/access";
import { HRM_NAV } from "@/entities/admin-hrm";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGrid } from "@/shared/lib/useGrid";
import { HubTile } from "./HubTile";
import { useHubBadges } from "./useHubBadges";

const GAP = 10;

// The sub-areas this user may open as a 3-column launcher, grouped like the web sidebar, with live badges.
export function HubGrid() {
  const { t } = useT();
  const a = useAccess();
  const badges = useHubBadges();
  const { width } = useWindowDimensions();
  const grid = useGrid({ gap: GAP, min: 150, minCols: 3 });
  const tile = grid.cell?.width ?? Math.floor((width - 32 - GAP * 2) / 3);
  let n = 0;
  const groups = HRM_NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || a.canInternal(i.perm)) })).filter((g) => g.items.length);
  return (
    <View style={{ gap: 18 }}>
      {groups.map((g) => (
        <View key={g.key} style={{ gap: 10 }}>
          <Text variant="kicker" tone="gray2" style={{ marginLeft: 4 }}>{t(`admHrm.groups.${g.key}`).toUpperCase()}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }} onLayout={grid.onLayout}>{grid.ready ? g.items.map((i) => <HubTile key={i.key} item={i} badge={badges[i.key]} index={n++} width={tile} move={grid.move} />) : null}</View>
        </View>
      ))}
    </View>
  );
}
