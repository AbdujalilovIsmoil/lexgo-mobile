import { StyleSheet, View } from "react-native";
import { cardTone, type CardKind } from "@/entities/pro-files";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { kind: CardKind; icon: IconName; tag?: string; name: string; meta: string; starred: boolean; width: number; onPress: () => void; onMore: () => void };

// A file as a compact tile: a small sheet of paper in its type colour (folded corner, icon, type badge) beside the name and
// size, with the actions button at the end. No cover and no tinted backdrop, so it never reads as a folder.
export function FileCard({ kind, icon, tag, name, meta, starred, width, onPress, onMore }: Props) {
  const tone = cardTone(kind);
  const c = useColors();
  return (
    <View style={[s.card, { width, backgroundColor: c.surface, borderColor: c.line }]}>
      <PressableScale scale={0.98} onPress={onPress} accessibilityLabel={name} style={s.main}>
        <View style={[s.page, { borderColor: tone.front }]}>
          <View style={[s.fold, { backgroundColor: tone.front2 }]} />
          <Icon name={icon} size={18} color={tone.front} />
          {tag ? <View style={[s.badge, { backgroundColor: tone.front }]}><Text variant="caption" weight="bold" tone="white" style={s.tagTx}>{tag}</Text></View> : null}
        </View>
        <View style={s.text}>
          <Text variant="small" weight="bold" numberOfLines={2}>{name}</Text>
          <View style={s.metaRow}>
            {starred ? <Icon name="star" size={11} color="#F5A623" /> : null}
            <Text variant="caption" tone="gray" numberOfLines={1}>{meta}</Text>
          </View>
        </View>
      </PressableScale>
      <PressableScale onPress={onMore} hitSlop={8} accessibilityLabel={name} style={s.more}><Icon name="more-horizontal" size={18} color={c.gray} /></PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: 14, borderRadius: radius.r, borderWidth: 1, minHeight: 68 },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 9, paddingLeft: 11 },
  page: { width: 40, height: 50, borderRadius: 6, borderTopRightRadius: 0, borderWidth: 1.5, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  fold: { position: "absolute", top: -1.5, right: -1.5, width: 13, height: 13, borderBottomLeftRadius: 5 },
  badge: { position: "absolute", bottom: -6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 999 },
  tagTx: { fontSize: 8, letterSpacing: 0.3 },
  text: { flex: 1, gap: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  more: { width: 40, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
});
