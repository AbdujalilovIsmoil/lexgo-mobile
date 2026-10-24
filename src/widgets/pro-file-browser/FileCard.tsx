import { StyleSheet, View } from "react-native";
import { cardTone, type CardKind } from "@/entities/pro-files";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { kind: CardKind; icon: IconName; tag?: string; name: string; meta: string; starred: boolean; width: number; onPress: () => void; onMore: () => void };

// A file at the same size as a folder card: a plain bordered tile (no tinted backdrop) with a sheet of paper in its type colour
// (folded corner, icon, type badge) in the middle; name and size sit underneath exactly like a folder's. No opening cover.
export function FileCard({ kind, icon, tag, name, meta, starred, width, onPress, onMore }: Props) {
  const tone = cardTone(kind);
  const c = useColors();
  return (
    <View style={{ width }}>
      <PressableScale scale={0.97} onPress={onPress} accessibilityLabel={name} style={s.hit}>
        <View style={[s.box, { backgroundColor: c.surface, borderColor: c.line }]}>
          <View style={[s.page, { borderColor: tone.front }]}>
            <View style={[s.fold, { backgroundColor: tone.front2 }]} />
            <Icon name={icon} size={26} color={tone.front} />
            {tag ? <View style={[s.badge, { backgroundColor: tone.front }]}><Text variant="caption" weight="bold" tone="white" style={s.tagTx}>{tag}</Text></View> : null}
          </View>
        </View>
      </PressableScale>
      {starred ? <View style={s.star}><Icon name="star" size={10} color="#FFFFFF" /></View> : null}
      <PressableScale onPress={onMore} hitSlop={8} accessibilityLabel={name} style={[s.more, { backgroundColor: c.surface2 }]}><Icon name="more-horizontal" size={16} color={c.gray} /></PressableScale>
      <Text variant="small" weight="bold" numberOfLines={1} center style={s.name}>{name}</Text>
      <Text variant="caption" tone="gray" numberOfLines={1} center>{meta}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hit: { paddingTop: 14, paddingBottom: 4 },
  box: { aspectRatio: 1.5, borderRadius: radius.rl, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  page: { height: "68%", aspectRatio: 0.8, borderRadius: 8, borderTopRightRadius: 0, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  fold: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderBottomLeftRadius: 7 },
  badge: { position: "absolute", bottom: -8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  tagTx: { fontSize: 9, letterSpacing: 0.4 },
  star: { position: "absolute", top: 18, left: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: "#F5A623", alignItems: "center", justifyContent: "center" },
  more: { position: "absolute", top: 18, right: 6, width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  name: { marginTop: 2 },
});
