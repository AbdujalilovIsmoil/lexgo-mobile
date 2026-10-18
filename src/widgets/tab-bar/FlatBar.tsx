import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { shadows, useColors } from "@/shared/theme";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useTabItems } from "./useTabItems";

// Android: the original flat bar (glass background, top hairline, raised AI
// button in the centre). iOS uses the liquid glass bar instead.
export function FlatBar(props: BottomTabBarProps) {
  const c = useColors();
  const insets = useInsets();
  const { items } = useTabItems(props);
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View style={[s.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 6 }, shadows.s2]}>
        {items.map((it) => (it.def.center ? <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} /> : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingTop: 8, paddingHorizontal: 6, borderTopWidth: 1 },
});
