import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { shadows, useTheme } from "@/shared/theme";
import { AiOrbButton } from "./AiOrbButton";
import { loadGlass } from "./glass";
import { LiquidIndicator } from "./LiquidIndicator";
import { LiquidItem } from "./LiquidItem";
import { useTabItems } from "./useTabItems";

// iOS: a floating pill of liquid glass (the system material on iOS 26, a live blur before it) with a glass lens under the active
// tab. Tap a tab, or press anywhere on the bar and slide: the lens follows the finger and the tab under it opens on release.
export function LiquidBar(props: BottomTabBarProps) {
  const { dark } = useTheme();
  const insets = useInsets();
  const { items, activeIndex } = useTabItems(props);
  const [width, setWidth] = useState(0);
  const slot = Math.max(width - PAD * 2, 0) / Math.max(items.length, 1);
  const [hover, setHover] = useState(-1); // the tab under the finger while dragging along the bar
  const count = items.length;
  const last = useSharedValue(-1);
  const lift = useSharedValue(0); // 1 while a finger is on the bar: the lens swells
  const track = (i: number) => { selectHaptic(); setHover(i); };
  const drop = (i: number) => {
    setHover(-1);
    const hit = items[i];
    if (hit && !hit.focused) hit.onPress();
  };
  const at = (x: number) => { "worklet"; return Math.max(0, Math.min(count - 1, Math.floor((x - PAD) / Math.max(slot, 1)))); };
  const slide = Gesture.Pan()
    .onBegin(() => { lift.value = withSpring(1, { damping: 14, stiffness: 260 }); })
    .minDistance(8)
    .activeOffsetX([-8, 8])
    .failOffsetY([-24, 24])
    .onUpdate((e) => {
      const i = at(e.x);
      if (i !== last.value) { last.value = i; scheduleOnRN(track, i); }
    })
    .onEnd((e, ok) => { last.value = -1; if (ok) scheduleOnRN(drop, at(e.x)); })
    .onFinalize((_, ok) => {
      lift.value = withSpring(0, { damping: 14, stiffness: 220 });
      if (!ok) { last.value = -1; scheduleOnRN(drop, -1); }
    });
  const shown = hover >= 0 ? hover : activeIndex;
  const centerActive = shown >= 0 && !!items[shown]?.def.center;
  return (
    <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: Math.max(insets.bottom - 8, 12) }]}>
      <View style={[s.shadow, (!GLASS || !dark) && shadows.s2]}>
        {GLASS ? (
          <View style={s.under} pointerEvents="none">
            <BlurView intensity={dark ? 70 : 80} tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} />
          </View>
        ) : null}
        {GLASS ? (
          // One glass container: the bar and the lens are neighbouring pieces of the same liquid surface, so they blend as the lens moves.
          <GLASS.Container spacing={16} style={[s.glass, s.bare]}>
            <GLASS.View glassEffectStyle="regular" colorScheme={dark ? "dark" : "light"} tintColor={dark ? "rgba(16,64,190,0.52)" : "rgba(22,104,240,0.30)"} style={[StyleSheet.absoluteFill, s.round]} />
            {width > 0 ? <LiquidIndicator left={PAD + 2} index={Math.max(shown, 0)} slot={slot} hidden={shown < 0 || centerActive} lift={lift} /> : null}
          </GLASS.Container>
        ) : (
          <View style={s.glass}>
            <BlurView intensity={dark ? 60 : 75} tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={[dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]} style={s.sheen} pointerEvents="none" />
          </View>
        )}
        <GestureDetector gesture={slide}>
        <View style={s.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {!GLASS && width > 0 ? <LiquidIndicator left={PAD + 2} index={Math.max(shown, 0)} slot={slot} hidden={shown < 0 || centerActive} lift={lift} /> : null}
          {items.map((it) => (it.def.center ? <AiOrbButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <LiquidItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
        </View>
        </GestureDetector>
      </View>
    </View>
  );
}

const PAD = 4;
const GLASS = loadGlass();

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14 },
  shadow: { borderRadius: 35 },
  glass: { ...StyleSheet.absoluteFill, borderRadius: 35, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth * 2, borderColor: "rgba(255,255,255,0.35)" },
  round: { borderRadius: 35 },
  under: { ...StyleSheet.absoluteFill, borderRadius: 35, overflow: "hidden" },
  bare: { borderWidth: 0, overflow: "visible" },
  sheen: { position: "absolute", left: 0, right: 0, top: 0, height: 34 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: PAD, height: 70 },
});
