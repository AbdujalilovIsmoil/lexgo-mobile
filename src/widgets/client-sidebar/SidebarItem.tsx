import { StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { brand, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { NavItem } from "./navItems";

type Props = { p: SharedValue<number>; index: number; item: NavItem; label: string; active: boolean; badge?: number; onPress: () => void };

// One sidebar row: an icon tile, the title, an optional unread badge; the open page is filled with the brand blue.
export function SidebarItem({ p, index, item, label, active, badge, onPress }: Props) {
  const c = useColors();
  // The rows arrive one after another as the drawer opens (a small cascade), and leave with it.
  const enter = useAnimatedStyle(() => {
    const k = interpolate(p.value, [0.25 + Math.min(index, 14) * 0.03, 0.75 + Math.min(index, 14) * 0.012], [0, 1], Extrapolation.CLAMP);
    return { opacity: k, transform: [{ translateX: (1 - k) * -18 }] };
  });
  return (
    <Animated.View style={enter}>
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="menuitem" accessibilityState={{ selected: active }} style={[s.row, active && { backgroundColor: brand.b600 }]}>
      <View style={[s.ico, { backgroundColor: active ? "rgba(255,255,255,0.2)" : c.tint2 }]}><Icon name={item.icon} size={17} color={active ? "#FFFFFF" : c.accent} /></View>
      <Text variant="small" weight={active ? "bold" : "semibold"} numberOfLines={1} style={[s.txt, active && { color: "#FFFFFF" }]}>{label}</Text>
      {badge ? <View style={s.badge}><Text variant="caption" weight="bold" tone="white">{badge > 99 ? "99+" : badge}</Text></View> : null}
    </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 16 },
  ico: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: "#E5484D", alignItems: "center", justifyContent: "center" },
});
