import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useTabItems } from "./useTabItems";

// Android: the Material 3 navigation bar — a tonal container, no outline, a pill indicator behind the active icon, the label always
// shown. The AI destination keeps its place in the middle and carries the brand gradient in its indicator. iOS uses the system bar.
export function FlatBar(props: BottomTabBarProps) {
  const c = useColors();
  const insets = useInsets();
  const { items } = useTabItems(props);
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View style={[s.bar, { backgroundColor: c.tint, paddingBottom: insets.bottom + 8 }]}>
        {items.map((it) => (it.def.center ? <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 12, paddingHorizontal: 8 },
});
