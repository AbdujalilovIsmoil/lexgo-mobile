import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { GlassBackdrop, useGlass } from "@/shared/ui";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useTabItems } from "./useTabItems";

const IOS = Platform.OS === "ios";
const RADIUS = 34;

// The app's own bar (Android and iPhone; an iPad keeps the system bar): outline icons with the caption under them, a small dot under the
// active one, and the AI button raised out of the middle. On an iPhone it is a floating capsule of iOS 26 Liquid Glass (the blur of the
// system material before iOS 26 or with Reduce Transparency); on Android a plain sheet with a hairline on top.
export function FlatBar(props: BottomTabBarProps) {
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const glass = useGlass(true);
  const { items } = useTabItems(props);
  const row = items.map((it) => (it.def.center ? <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />));
  if (IOS) {
    return (
      <View pointerEvents="box-none" style={[s.wrap, s.float, { bottom: Math.max(insets.bottom - 14, 10) }]}>
        <View style={[s.capsule, { borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)" }]}>
          {glass ? <GlassBackdrop radius={RADIUS} interactive always /> : <BlurView tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} intensity={90} style={[StyleSheet.absoluteFill, s.clip]} />}
          {row}
        </View>
      </View>
    );
  }
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View style={[s.bar, { backgroundColor: dark ? c.surface : "#FFFFFF", borderTopColor: c.line, paddingBottom: Math.max(insets.bottom - 6, 8) }]}>{row}</View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  float: { paddingHorizontal: 14 },
  capsule: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 9, paddingBottom: 3, paddingHorizontal: 6,
    borderRadius: RADIUS, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#0B1F45", shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  clip: { borderRadius: RADIUS, overflow: "hidden" },
  bar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 10, paddingHorizontal: 6, borderTopWidth: StyleSheet.hairlineWidth, elevation: 12 },
});
