import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useGrid } from "@/shared/lib/useGrid";
import { Fade } from "./Fade";

export type WorkTile = { key: string; icon: IconName; tint: string; title: string; sub: string; to: string; hot?: boolean };

// The four doors of the day as calm white cards in a 2×2 grid: a tinted icon chip on top, the title and a live count under it
// (urgent work, opportunities, today's calendar, document requests). A card with work waiting gets a small dot on its chip.
export function WorkTiles({ items }: { items: WorkTile[] }) {
  const c = useColors();
  const router = useRouter();
  const g = useGrid({ count: items.length });
  return (
    <View style={[s.grid, g.row]} onLayout={g.onLayout}>
      {g.ready ? items.map((x, i) => (
        <View key={x.key} style={[s.cell, g.tile]}>
          <Fade i={i}>
            <PressableScale onPress={() => router.push(x.to as never)} accessibilityRole="button" accessibilityLabel={`${x.title}: ${x.sub}`} style={[s.tile, shadows.s1, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              <View style={[s.ico, { backgroundColor: `${x.tint}1F` }]}>
                <Icon name={x.icon} size={20} color={x.tint} />
                {x.hot ? <View style={[s.dot, { backgroundColor: x.tint, borderColor: c.glassFill }]} /> : null}
              </View>
              <View style={s.txt}>
                <Text variant="body" weight="bold" numberOfLines={1}>{x.title}</Text>
                <Text variant="small" tone="gray" numberOfLines={1}>{x.sub}</Text>
              </View>
            </PressableScale>
          </Fade>
        </View>
      )) : null}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "48.5%" },
  tile: { height: 132, padding: 16, borderRadius: radius.rl, borderWidth: 1, justifyContent: "space-between" },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  txt: { gap: 2 },
});
