import { StyleSheet, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { cardTone, type CardKind } from "@/entities/pro-files";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { kind: CardKind; icon: IconName; tag?: string; name: string; meta: string; starred: boolean; width: number; onPress: () => void; onMore: () => void };

const SPRING = { damping: 16, stiffness: 220 };
function sheet(p: SharedValue<number>, deg: number) {
  "worklet";
  return { transformOrigin: "bottom" as const, transform: [{ perspective: 700 }, { rotateX: `${-deg * p.value}deg` }] };
}

// The web's 3D folder: back cover with its tab, three sheets and the front cover with the type badge. Pressing it swings the front
// cover down and fans the sheets out (the web does this on hover); letting go opens the folder or the file. A file also carries its
// type icon large in the middle of the cover, so a file never reads as a folder at a glance.
export function FolderCard({ kind, icon, tag, name, meta, starred, width, onPress, onMore }: Props) {
  const tone = cardTone(kind);
  const p = useSharedValue(0);
  const calm = useReducedMotion();
  const s3 = useAnimatedStyle(() => sheet(p, 20));
  const s2 = useAnimatedStyle(() => sheet(p, 30));
  const s1 = useAnimatedStyle(() => sheet(p, 38));
  const front = useAnimatedStyle(() => sheet(p, 46));
  // eslint-disable-next-line react-hooks/immutability
  const to = (v: number) => (p.value = calm ? 0 : withSpring(v, SPRING));
  return (
    <View style={{ width }}>
      <PressableScale scale={0.98} onPressIn={() => to(1)} onPressOut={() => to(0)} onPress={onPress} accessibilityLabel={name} style={s.hit}>
        <View style={s.box}>
          <View style={[s.back, { backgroundColor: tone.back }]}><View style={[s.tab, s.backTab, { backgroundColor: tone.back }]} /></View>
          <Animated.View style={[s.sheet, { backgroundColor: "#C9D3E0" }, s3]} />
          <Animated.View style={[s.sheet, { backgroundColor: "#E3E9F1" }, s2]} />
          <Animated.View style={[s.sheet, { backgroundColor: "#FFFFFF" }, s1]} />
          <Animated.View style={[s.front, front]}>
            <LinearGradient colors={[tone.front, tone.front2]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} />
            <View style={[s.tab, s.frontTab, { backgroundColor: tone.front2 }]} />
            {kind !== "folder" ? <View pointerEvents="none" style={s.glyph}><View style={s.glyphBox}><Icon name={icon} size={26} tone="white" /></View></View> : null}
            <View style={s.badge}><Icon name={icon} size={12} tone="white" />{tag ? <Text variant="caption" weight="bold" tone="white" style={s.tagTx}>{tag}</Text> : null}</View>
          </Animated.View>
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
  box: { aspectRatio: 1.5 },
  back: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 16, borderTopLeftRadius: 0 },
  tab: { position: "absolute", height: 14, top: -13, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  backTab: { left: 0, width: "34%" },
  frontTab: { right: 0, width: "62%" },
  sheet: { position: "absolute", left: 4, right: 4, top: 4, bottom: 0, borderRadius: 13, backfaceVisibility: "hidden" },
  front: { position: "absolute", left: 0, right: 0, bottom: 0, top: 4, borderRadius: 16, borderTopRightRadius: 0, justifyContent: "flex-end", backfaceVisibility: "hidden" },
  glyph: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", paddingBottom: 16 },
  glyphBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", margin: 9, marginTop: 0, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.24)" },
  tagTx: { fontSize: 10, letterSpacing: 0.4 },
  star: { position: "absolute", top: 18, left: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: "#F5A623", alignItems: "center", justifyContent: "center" },
  more: { position: "absolute", top: 18, right: 6, width: 28, height: 28, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  name: { marginTop: 2 },
});
