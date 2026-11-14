import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { radius, shadows, useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

export type WorkCard = { key: string; icon: LucideIcon; tint: string; title: string; sub: string; to: string; badge?: number };

// A soft wave across the card's bottom-right corner, in the card's own tint.
function Wave({ tint, id }: { tint: string; id: string }) {
  return (
    <Svg width="100%" height={64} viewBox="0 0 200 64" preserveAspectRatio="none" style={s.wave} pointerEvents="none">
      <Defs>
        <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity="0.08" />
          <Stop offset="1" stopColor={tint} stopOpacity="0.45" />
        </SvgGradient>
      </Defs>
      <Path d="M70 64 C 110 60, 130 30, 165 22 C 185 18, 195 14, 200 10 L 200 64 Z" fill={`url(#${id})`} />
      <Path d="M110 64 C 140 58, 160 40, 200 34 L 200 64 Z" fill={tint} fillOpacity={0.18} />
    </Svg>
  );
}

// Two big doors side by side (Tezkor ishlar and — an advokat — Vazifalar, a yurist the order feed): a tinted icon chip (with a count badge
// when work waits), a round chevron, the title and a live line, over a wave in the card's colour.
export function WorkCards({ items }: { items: WorkCard[] }) {
  const router = useRouter();
  const { colors: c } = useTheme();
  return (
    <View style={s.row}>
      {items.map(({ key, icon: Glyph, tint, title, sub, to, badge }) => (
        <PressableScale key={key} onPress={() => router.push(to as never)} scale={0.97} accessibilityRole="button" accessibilityLabel={`${title}: ${sub}`} style={[s.card, shadows.s1, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Wave tint={tint} id={`wave-${key}`} />
          <View style={s.top}>
            <View style={[s.ico, { backgroundColor: `${tint}1F` }]}>
              <Glyph size={24} color={tint} strokeWidth={2.1} />
              {badge ? <View style={[s.badge, { backgroundColor: c.accent, borderColor: c.surface }]}><Text variant="caption" weight="bold" style={s.badgeTx}>{badge}</Text></View> : null}
            </View>
            <View style={[s.go, { backgroundColor: c.tint2 }]}><ChevronRight size={16} color={c.accent} strokeWidth={2.5} /></View>
          </View>
          <View style={s.txt}>
            <Text variant="h4" weight="bold" numberOfLines={1}>{title}</Text>
            <Text variant="small" tone="gray" numberOfLines={1}>{sub}</Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  card: { flex: 1, height: 150, borderRadius: radius.rl, borderWidth: 1, padding: 16, justifyContent: "space-between", overflow: "hidden" },
  wave: { position: "absolute", left: 0, right: 0, bottom: 0 },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  ico: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -7, right: -7, minWidth: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeTx: { color: "#FFFFFF", fontSize: 11, lineHeight: 14 },
  go: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  txt: { gap: 2 },
});
