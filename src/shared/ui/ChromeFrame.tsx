import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { setHeaderHeight, usePageChrome } from "@/shared/lib/pageChrome";
import { useColors, useTheme } from "@/shared/theme";

// The frame of a stack screen's header (bar + the banner slot). On iOS the page's scroll view (Screen) runs up under it, and as the page
// moves the canvas behind the header turns into blur glass with a hairline, so the content passes under a pane of glass. Elsewhere, or
// with `off`, it is a plain pass-through and nothing changes.
export function ChromeFrame({ children, off }: { children: ReactNode; off?: boolean }) {
  const c = useColors();
  const { dark } = useTheme();
  const chrome = usePageChrome();
  const live = Platform.OS === "ios" && !off;
  useEffect(() => { if (!live) return; return () => setHeaderHeight(chrome, 0); }, [live, chrome]);
  // Only the shared value goes into the worklets: capturing `chrome` would freeze the whole record (its height and listeners) on the UI
  // thread, and the next header height written to it would be refused.
  const y = chrome.y;
  const canvas = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, Math.max(0, y.value / 14)) }));
  const glass = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, y.value / 14)) }));
  if (!live) return <>{children}</>;
  return (
    <View style={s.live} onLayout={(e) => setHeaderHeight(chrome, e.nativeEvent.layout.height)}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.canvas }, canvas]} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glass]}>
        <BlurView intensity={70} tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} />
        <View style={[s.hair, { backgroundColor: c.line }]} />
      </Animated.View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  live: { zIndex: 5 },
  hair: { position: "absolute", left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
});
