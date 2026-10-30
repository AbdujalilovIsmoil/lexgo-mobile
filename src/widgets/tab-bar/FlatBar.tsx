import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useTabItems } from "./useTabItems";

const PAD = 6;
const PILL_W = 58;
const PILL_H = 34;
const TOP = 10;
const ICON_BOX = 28;
const FLOAT = { damping: 15, stiffness: 190, mass: 0.8 };

// Android's bar (iOS has the system bar, NativeTabsBar): a plain sheet with a hairline on top, outline icons with the caption under
// them, a small dot under the active one, and the AI button raised out of the middle. Behind the active icon floats a tinted pill that
// glides to the pressed tab, stretching a little on the way.
export function FlatBar(props: BottomTabBarProps) {
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const { items } = useTabItems(props);
  const [w, setW] = useState(0);
  const active = items.findIndex((i) => i.focused && !i.def.center);
  const slot = items.length ? (w - PAD * 2) / items.length : 0;
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.bar, { backgroundColor: dark ? c.surface : "#FFFFFF", borderTopColor: c.line, paddingBottom: Math.max(insets.bottom - 6, 8) }]}>
        {slot ? <FloatPill x={PAD + Math.max(active, 0) * slot + slot / 2 - PILL_W / 2} visible={active >= 0} color={dark ? "rgba(255,255,255,0.10)" : "#E7EEFF"} /> : null}
        {items.map((it) => (it.def.center ? <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
      </View>
    </View>
  );
}

function FloatPill({ x, visible, color }: { x: number; visible: boolean; color: string }) {
  const calm = useReducedMotion();
  const tx = useSharedValue(x);
  const stretch = useSharedValue(1);
  const shown = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    if (calm) { tx.set(x); return; }
    tx.set(withSpring(x, FLOAT));
    stretch.set(withSequence(withTiming(1.35, { duration: 120 }), withSpring(1, FLOAT)));
  }, [x, calm, tx, stretch]);
  useEffect(() => { shown.set(withTiming(visible ? 1 : 0, { duration: 160 })); }, [visible, shown]);
  const style = useAnimatedStyle(() => ({ opacity: shown.get(), transform: [{ translateX: tx.get() }, { scaleX: stretch.get() }, { scaleY: 1.9 - stretch.get() * 0.9 }] }));
  return <Animated.View pointerEvents="none" style={[s.pill, { backgroundColor: color }, style]} />;
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: TOP, paddingHorizontal: PAD, borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ ios: { shadowColor: "#0B1F45", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } }, default: { elevation: 12 } }),
  },
  pill: { position: "absolute", left: 0, top: TOP + (ICON_BOX - PILL_H) / 2, width: PILL_W, height: PILL_H, borderRadius: PILL_H / 2 },
});
