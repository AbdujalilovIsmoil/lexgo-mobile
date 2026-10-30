import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useIsAuthed } from "@/entities/session";
import { freshAiChat } from "@/features/ai-chat";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { LiquidGlass, useLiquidGlass } from "@/shared/ui";
import { useState } from "react";
import { AiButton } from "./AiButton";
import { FlatItem } from "./FlatItem";
import { useVisibleTabs } from "./useTabItems";

const RADIUS = 32;

// iOS: a tab page the system bar does not hold (the profile, the directory, orders) opens as a stack screen (/m/<name>), where the system
// bar cannot be shown. This floating glass bar stands in for it there — the role's tabs and the AI button, none of them active — so the
// way back to every tab is one tap, as on Android.
export function StackTabBar() {
  const router = useRouter();
  const insets = useInsets();
  const { dark } = useTheme();
  const authed = useIsAuthed();
  const glass = useLiquidGlass();
  const defs = useVisibleTabs();
  const [box, setBox] = useState({ w: 0, h: 0 });
  if (Platform.OS !== "ios") return null;
  const press = (route: string, auth?: boolean, center?: boolean) => {
    selectHaptic();
    if (auth && !authed) return router.push("/auth/login");
    if (center) freshAiChat();
    router.navigate((route === "index" ? "/" : `/(tabs)/${route}`) as never);
  };
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: Math.max(insets.bottom - 14, 10) }]}>
      <View onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={[s.capsule, { borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)" }]}>
        {glass ? <LiquidGlass width={box.w} height={box.h} interactive /> : <BlurView tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} intensity={90} style={[StyleSheet.absoluteFill, s.clip]} />}
        {defs.map((d) => (d.center ? <AiButton key={d.route} focused={false} labelKey={d.labelKey} onPress={() => press(d.route, d.auth, true)} /> : <FlatItem key={d.route} def={d} focused={false} onPress={() => press(d.route, d.auth)} />))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14 },
  capsule: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 9, paddingBottom: 4, paddingHorizontal: 6, borderRadius: RADIUS, borderWidth: StyleSheet.hairlineWidth, shadowColor: "#0B1F45", shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  clip: { borderRadius: RADIUS, overflow: "hidden" },
});
