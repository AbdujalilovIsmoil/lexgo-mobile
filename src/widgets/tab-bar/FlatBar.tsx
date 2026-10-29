import { useState, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { LiquidGlass, useLiquidGlass } from "@/shared/ui";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useTabLens } from "./TabLens";
import { useTabItems } from "./useTabItems";

const IOS = Platform.OS === "ios";
const RADIUS = 34;
const PAD = 6;

// The app's own bar (Android and iPhone; an iPad keeps the system bar): outline icons with the caption under them, a small dot under the
// active one, and the AI button raised out of the middle. On an iPhone it is a floating capsule of iOS 26 Liquid Glass drawn by SwiftUI (Expo UI;
// the blur of the system material before iOS 26 or with Reduce Transparency) with the glass selection lens you can slide; on Android a plain sheet with a hairline on top.
export function FlatBar(props: BottomTabBarProps) {
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const { items } = useTabItems(props);
  const row = items.map((it) => (it.def.center ? <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />));
  if (IOS) {
    return (
      <View pointerEvents="box-none" style={[s.wrap, s.float, { bottom: Math.max(insets.bottom - 14, 10) }]}>
        <Capsule active={items.findIndex((i) => i.focused)} count={items.length} onPick={(i) => items[i]?.onPress()} dark={dark}>{row}</Capsule>
      </View>
    );
  }
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View style={[s.bar, { backgroundColor: dark ? c.surface : "#FFFFFF", borderTopColor: c.line, paddingBottom: Math.max(insets.bottom - 6, 8) }]}>{row}</View>
    </View>
  );
}

type CapsuleProps = { active: number; count: number; onPick: (i: number) => void; dark: boolean; children: ReactNode };

// The capsule measures itself so the selection lens (TabLens) knows the slots; the lens sits over the glass and under the tabs.
function Capsule({ active, count, onPick, dark, children }: CapsuleProps) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const glass = useLiquidGlass();
  const { gesture, lens } = useTabLens({ ...box, pad: PAD, count }, active, onPick);
  return (
    <GestureDetector gesture={gesture}>
      <View onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })} style={[s.capsule, { borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)" }]}>
        {glass ? <LiquidGlass width={box.width} height={box.height} interactive /> : <BlurView tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} intensity={90} style={[StyleSheet.absoluteFill, s.clip]} />}
        {lens}
        {children}
      </View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  float: { paddingHorizontal: 14 },
  capsule: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 9, paddingBottom: 6, paddingHorizontal: PAD,
    borderRadius: RADIUS, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#0B1F45", shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  clip: { borderRadius: RADIUS, overflow: "hidden" },
  bar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 10, paddingHorizontal: 6, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12 },
});
