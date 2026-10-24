import { StyleSheet, View } from "react-native";
import { cardTone, type CardKind } from "@/entities/pro-files";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { kind: CardKind; icon: IconName; tag?: string; name: string; meta: string; starred: boolean; width: number; onPress: () => void; onMore: () => void };

const FOLD = 22;

// A file as a sheet of paper: a folded top corner, the type icon, a few text lines and the type badge. No opening cover, so a
// file never reads as a folder; it sits on a soft tile of its type colour at the same size as a folder card.
export function FileCard({ kind, icon, tag, name, meta, starred, width, onPress, onMore }: Props) {
  const tone = cardTone(kind);
  return (
    <View style={{ width }}>
      <PressableScale scale={0.97} onPress={onPress} accessibilityLabel={name} style={s.hit}>
        <View style={[s.box, { backgroundColor: tone.front + "26" }]}>
          <View style={s.page}>
            <View style={[s.fold, { backgroundColor: tone.front2 }]} />
            <View style={[s.glyph, { backgroundColor: tone.front }]}><Icon name={icon} size={20} tone="white" /></View>
            <View style={s.lines}>
              <View style={[s.line, { width: "86%" }]} /><View style={[s.line, { width: "64%" }]} /><View style={[s.line, { width: "76%" }]} />
            </View>
            {tag ? <View style={[s.badge, { backgroundColor: tone.front }]}><Text variant="caption" weight="bold" tone="white" style={s.tagTx}>{tag}</Text></View> : null}
          </View>
        </View>
      </PressableScale>
      {starred ? <View style={s.star}><Icon name="star" size={10} color="#FFFFFF" /></View> : null}
      <PressableScale onPress={onMore} hitSlop={8} accessibilityLabel={name} style={s.more}><Icon name="more-horizontal" size={16} color="#3A4A60" /></PressableScale>
      <Text variant="small" weight="bold" numberOfLines={1} center style={s.name}>{name}</Text>
      <Text variant="caption" tone="gray" numberOfLines={1} center>{meta}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hit: { paddingTop: 14, paddingBottom: 4 },
  box: { aspectRatio: 1.5, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  page: { height: "82%", aspectRatio: 0.78, backgroundColor: "#FFFFFF", borderRadius: 8, borderTopRightRadius: 0, padding: 9, gap: 8, shadowColor: "#0B1B33", shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3, overflow: "hidden" },
  fold: { position: "absolute", top: 0, right: 0, width: FOLD, height: FOLD, borderBottomLeftRadius: 8, opacity: 0.85 },
  glyph: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  lines: { gap: 5 },
  line: { height: 4, borderRadius: 2, backgroundColor: "#E3E9F1" },
  badge: { position: "absolute", left: 9, bottom: 9, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  tagTx: { fontSize: 9, letterSpacing: 0.4 },
  star: { position: "absolute", top: 18, left: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: "#F5A623", alignItems: "center", justifyContent: "center" },
  more: { position: "absolute", top: 18, right: 6, width: 28, height: 28, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  name: { marginTop: 2 },
});
