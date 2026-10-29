import { Platform, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useTabItems } from "./useTabItems";

// The app's own bar (Android and iPhone; an iPad keeps the system bar): a plain sheet with a hairline on top, outline icons with the caption under
// them, a small dot under the active one, and the AI button raised out of the middle.
export function FlatBar(props: BottomTabBarProps) {
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const { items } = useTabItems(props);
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View style={[s.bar, { backgroundColor: dark ? c.surface : "#FFFFFF", borderTopColor: c.line, paddingBottom: Math.max(insets.bottom - 6, 8) }]}>
        {items.map((it) => (it.def.center ? <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 10, paddingHorizontal: 6, borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ ios: { shadowColor: "#0B1F45", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } }, default: { elevation: 12 } }),
  },
});
