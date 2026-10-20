import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import type { IconName } from "@/shared/ui";
import { gradient, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { TabCell } from "./TabCell";

export type ProfileTab = "profile" | "security" | "payments" | "complaints" | "activity";
export type TabDef<K extends string = ProfileTab> = { key: K; icon: IconName; label: string };
export const PROFILE_TABS: TabDef[] = [
  { key: "profile", icon: "user", label: "ntd.pfTabProfile" },
  { key: "security", icon: "shield", label: "ntd.pfTabSecurity" },
  { key: "payments", icon: "credit-card", label: "ntd.pfTabPayments" },
  { key: "complaints", icon: "message-square", label: "ntd.pfTabComplaints" },
  { key: "activity", icon: "clock", label: "ntd.pfTabActivity" },
];
const PAD = 4;
const GAP = 4;
const SPRING = { damping: 20, stiffness: 230, mass: 0.9 };

// The profile's section switch (the client's five tabs by default, any list via `tabs`): equal tabs under one brand-gradient background that glides to the chosen tab
// with a spring (it can be mid-way between two tabs while moving), the icons and labels fading with it.
export function ProfileTabs<K extends string = ProfileTab>({ value, onChange, tabs = PROFILE_TABS as unknown as TabDef<K>[] }: { value: K; onChange: (v: K) => void; tabs?: TabDef<K>[] }) {
  const { t } = useT();
  const c = useColors();
  const [w, setW] = useState(0);
  const idx = tabs.findIndex((x) => x.key === value);
  const tabW = w ? (w - PAD * 2 - GAP * (tabs.length - 1)) / tabs.length : 0;
  const pos = useSharedValue(idx);
  useEffect(() => {
    // Reanimated shared values are mutated by design; the compiler rule cannot see that.
     
    pos.value = withSpring(idx, SPRING);
  }, [idx, pos]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value * (tabW + GAP) }] }));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.bar, { backgroundColor: c.glassFill, borderColor: c.glassLine }]} accessibilityRole="tablist">
      {tabW > 0 ? (
        <Animated.View pointerEvents="none" style={[s.thumb, { width: tabW }, thumb]}>
          <LinearGradient colors={[...gradient.primary]} locations={[...gradient.primaryStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      {tabs.map((x, i) => (
        <TabCell key={x.key} icon={x.icon} label={t(x.label)} index={i} pos={pos} active={i === idx} onPress={() => { if (i !== idx) { selectHaptic(); onChange(x.key); } }} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", gap: GAP, padding: PAD, borderRadius: 22, borderWidth: 1 },
  thumb: { position: "absolute", top: PAD, left: PAD, height: 56, borderRadius: 18, overflow: "hidden" },
});
