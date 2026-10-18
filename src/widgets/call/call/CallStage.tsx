import { useState } from "react";
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Text } from "@/shared/ui";
import { ParticipantTile } from "./ParticipantTile";
import type { Tile } from "./tiles";

export type StageMode = "grid" | "speaker";
type Props = { tiles: Tile[]; mode: StageMode; pinned: string | null; onPin: (id: string | null) => void; mirror: boolean; waiting: string };
const GAP = 8;

// The video area. Grid: 1–2 people stacked, more in two columns (scrolls past six). Speaker: a screen share,
// the pinned person or the one talking fills the stage and the rest sit in a strip. Tap a tile to pin it.
export function CallStage({ tiles, mode, pinned, onPin, mirror, waiting }: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const share = tiles.find((t) => t.share);
  const lead = share ?? (mode === "speaker" ? tiles.find((t) => t.id === pinned && !t.share) ?? tiles.find((t) => t.speaking && !t.local) ?? tiles.find((t) => !t.local) ?? tiles[0] : undefined);
  const view = (t: Tile, w: number, h: number) => <ParticipantTile key={t.key} tile={t} width={w} height={h} mirror={mirror} onPress={() => onPin(t.share ? null : t.id === pinned ? null : t.id)} />;
  if (!box.w) return <View style={s.fill} onLayout={onLayout} />;
  if (lead) {
    const rest = tiles.filter((t) => t !== lead);
    return (
      <View style={s.fill} onLayout={onLayout}>
        {view(lead, box.w, box.h - (rest.length ? 118 : 0) - GAP)}
        {rest.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.strip} contentContainerStyle={{ gap: GAP }}>{rest.map((t) => view(t, 88, 110))}</ScrollView> : null}
      </View>
    );
  }
  const cols = tiles.length <= 2 ? 1 : 2;
  const rows = Math.ceil(tiles.length / cols);
  const w = (box.w - GAP * (cols - 1)) / cols;
  const h = Math.max(150, (box.h - GAP * (rows - 1)) / rows);
  return (
    <View style={s.fill} onLayout={onLayout}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.grid, { minHeight: box.h }]}>{tiles.map((t) => view(t, w, h))}</ScrollView>
      {tiles.length <= 1 ? <Text variant="small" tone="white" center style={s.wait}>{waiting}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP, alignContent: "center" },
  strip: { flexGrow: 0, marginTop: GAP },
  wait: { position: "absolute", bottom: 14, left: 0, right: 0, opacity: 0.85 },
});
