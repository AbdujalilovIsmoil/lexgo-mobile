import { StyleSheet } from "react-native";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { brand, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { NavItem } from "./navItems";

// `reveal` (0 = a tablet's rail of icons, 1 = fully out) belongs to the tablet's docked sidebar: the icon tile never moves, the title, badge and
// the open row's fill fade with it while the panel's edge clips them. Without it (the phone's drawer) the row is exactly as it always was.
type Props = { p: SharedValue<number>; index: number; item: NavItem; label: string; active: boolean; badge?: number; reveal?: SharedValue<number>; onPress: () => void };

// One sidebar row: an icon tile, the title, an optional unread badge; the open page is filled with the brand blue.
export function SidebarItem({ p, index, item, label, active, badge, reveal, onPress }: Props) {
  const c = useColors();
  // The rows arrive one after another as the drawer opens (a small cascade), and leave with it.
  const enter = useAnimatedStyle(() => {
    const k = interpolate(p.value, [0.25 + Math.min(index, 14) * 0.03, 0.75 + Math.min(index, 14) * 0.012], [0, 1], Extrapolation.CLAMP);
    return { opacity: k, transform: [{ translateX: (1 - k) * -18 }] };
  });
  const fade = useAnimatedStyle(() => ({ opacity: reveal ? reveal.value : 1 }));
  const dotFade = useAnimatedStyle(() => ({ opacity: reveal ? 1 - reveal.value : 0 }));
  const tile = useAnimatedStyle(() => (active ? { backgroundColor: reveal ? interpolateColor(reveal.value, [0, 1], [brand.b600, "rgba(255,255,255,0.2)"]) : "rgba(255,255,255,0.2)" } : { backgroundColor: c.tint2 }));
  return (
    <Animated.View style={enter}>
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="menuitem" accessibilityLabel={reveal ? label : undefined} accessibilityState={{ selected: active }} style={[s.row, reveal && s.dock]}>
      {active ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.fill, fade]} /> : null}
      <Animated.View style={[s.ico, tile]}><Icon name={item.icon} size={17} color={active ? "#FFFFFF" : c.accent} /></Animated.View>
      <Animated.View style={[s.txt, fade]}>
        <Text variant="small" weight={active ? "bold" : "semibold"} numberOfLines={1} style={active && { color: "#FFFFFF" }}>{label}</Text>
      </Animated.View>
      {badge && reveal ? <Animated.View pointerEvents="none" style={[s.dot, dotFade]} /> : null}
      {badge ? <Animated.View style={[s.badge, fade]}><Text variant="caption" weight="bold" tone="white">{badge > 99 ? "99+" : badge}</Text></Animated.View> : null}
    </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 16 },
  dock: { paddingHorizontal: 11 }, // the tile's centre sits at the rail's centre (76 / 2), open or closed
  fill: { borderRadius: 16, backgroundColor: brand.b600 },
  ico: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 4, left: 36, width: 10, height: 10, borderRadius: 5, backgroundColor: "#E5484D" },
  txt: { flex: 1 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: "#E5484D", alignItems: "center", justifyContent: "center" },
});
