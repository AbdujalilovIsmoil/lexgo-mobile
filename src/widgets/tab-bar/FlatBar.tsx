import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useInsets } from "@/shared/lib/insets";
import { GLASS_SOLID, useTheme } from "@/shared/theme";
import { AiButton } from "./AiButton";
import { AI_FAB_GAP, AiFab } from "./AiFab";
import { floatingAi } from "./tabConfig";
import { UrgentButton } from "./UrgentButton";
import { useTabRole } from "./useTabRole";
import { FlatItem } from "./FlatItem";
import { useTabItems } from "./useTabItems";

const PAD = 6;
const TOP = 10;

// The tab bar on both platforms, in the Adliya look: a white sheet with rounded top corners and a soft shadow, outline
// icons with the caption under them, and the AI button raised out of the middle. The active icon turns white on a navy rounded square
// (FlatItem draws it). A client's centre slot is Tezkor (UrgentButton) and their AI floats in the bottom right corner above the bar (AiFab).
export function FlatBar(props: BottomTabBarProps) {
  const { colors: c, dark, glass } = useTheme();
  const insets = useInsets();
  const { items } = useTabItems(props);
  const role = useTabRole();
  const [h, setH] = useState(0);
  return (
    <>
    <View pointerEvents="box-none" style={s.wrap}>
      <View onLayout={(e) => setH(e.nativeEvent.layout.height)} collapsable={false} style={[s.bar, { backgroundColor: glass ? GLASS_SOLID : dark ? c.surface : "#FFFFFF", paddingBottom: Math.max(insets.bottom - 6, 8) }]}>
        {items.map((it) => (it.def.center ? (it.def.route === "urgent" ? <UrgentButton key={it.def.route} onPress={it.onPress} labelKey={it.def.labelKey} /> : <AiButton key={it.def.route} focused={it.focused} onPress={it.onPress} labelKey={it.def.labelKey} />) : <FlatItem key={it.def.route} def={it.def} focused={it.focused} onPress={it.onPress} />))}
      </View>
    </View>
    {floatingAi(role) && h ? <AiFab bottom={h + AI_FAB_GAP} /> : null}
    </>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: TOP, paddingHorizontal: PAD, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    ...Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: -6 } }, default: { elevation: 16 } }),
  },
});
