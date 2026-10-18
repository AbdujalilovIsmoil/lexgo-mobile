import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { shadows, useTheme } from "@/shared/theme";
import { AiOrbButton } from "./AiOrbButton";
import { LiquidIndicator } from "./LiquidIndicator";
import { LiquidItem } from "./LiquidItem";
import { useTabItems } from "./useTabItems";

// iOS: a floating pill of frosted glass (live blur of the content behind it)
// with a liquid droplet that glides to the tab you press.
export function LiquidBar(props: BottomTabBarProps) {
  const { dark } = useTheme();
  const insets = useInsets();
  const { items, activeIndex } = useTabItems(props);
  const [width, setWidth] = useState(0);
  const slot = Math.max(width - PAD * 2, 0) / Math.max(items.length, 1);
  const centerActive = activeIndex >= 0 && !!items[activeIndex].def.center;
  return (
    <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: Math.max(insets.bottom - 8, 12) }]}>
      <View style={[s.shadow, shadows.s2]}>
        <View style={s.glass}>
          <BlurView intensity={dark ? 60 : 75} tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={[dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]} style={s.sheen} pointerEvents="none" />
        </View>
        <View style={s.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 ? <LiquidIndicator left={PAD + 2} index={Math.max(activeIndex, 0)} slot={slot} hidden={activeIndex < 0 || centerActive} /> : null}
          {items.map((it) => (it.def.center ? <AiOrbButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <LiquidItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
        </View>
      </View>
    </View>
  );
}

const PAD = 4;

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14 },
  shadow: { borderRadius: 35 },
  glass: { ...StyleSheet.absoluteFill, borderRadius: 35, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth * 2, borderColor: "rgba(255,255,255,0.35)" },
  sheen: { position: "absolute", left: 0, right: 0, top: 0, height: 34 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: PAD, height: 70 },
});
