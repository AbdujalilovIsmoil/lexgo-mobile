import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/shared/theme";

type UI = { swift: typeof import("@expo/ui/swift-ui"); mods: typeof import("@expo/ui/swift-ui/modifiers") };

// Expo UI (SwiftUI) has a native part: a build made before it was added does not contain it and importing it up front would crash the
// start. Load it on first use; "not there" (or not iOS 26) means no glass and the caller keeps its fallback.
let cached: UI | null | undefined;
function loadUI(): UI | null {
  if (cached !== undefined) return cached;
  try {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const swift = require("@expo/ui/swift-ui") as UI["swift"];
    const mods = require("@expo/ui/swift-ui/modifiers") as UI["mods"];
    /* eslint-enable @typescript-eslint/no-require-imports */
    const v = Number.parseInt(String(Platform.Version), 10);
    cached = Platform.OS === "ios" && v >= 26 ? { swift, mods } : null;
  } catch {
    cached = null;
  }
  return cached;
}

// True where SwiftUI Liquid Glass can be drawn: iOS 26+, a build with Expo UI, and Reduce Transparency off.
export function useLiquidGlass(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let live = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((v) => { if (live) setReduce(v); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduce);
    return () => { live = false; sub.remove(); };
  }, []);
  return Platform.OS === "ios" && !reduce && !!loadUI();
}

type Props = {
  width: number;
  height: number;
  shape?: "capsule" | "circle" | "roundedRectangle";
  radius?: number; // roundedRectangle only
  tint?: string;
  clear?: boolean; // the clearer variant, for glass over busy content
  interactive?: boolean;
  scheme?: "light" | "dark"; // force a tone; by default the theme's
  style?: StyleProp<ViewStyle>;
};

// One piece of SwiftUI Liquid Glass (Expo UI `glassEffect`) that fills its parent, which must be exactly width × height. Touches pass through
// to the React Native views on top. Renders nothing where useLiquidGlass() is false.
export function LiquidGlass({ width, height, shape = "capsule", radius, tint, clear, interactive, scheme, style }: Props) {
  const ui = loadUI();
  const { dark } = useTheme();
  if (!ui || !width || !height) return null;
  const { Host, Spacer } = ui.swift;
  const { frame, glassEffect } = ui.mods;
  const glass = glassEffect({ glass: { variant: clear ? "clear" : "regular", interactive, tint }, shape, cornerRadius: radius });
  return (
    <Host pointerEvents="none" colorScheme={scheme ?? (dark ? "dark" : "light")} style={[StyleSheet.absoluteFill, style]}>
      <Spacer modifiers={[frame({ width, height }), glass]} />
    </Host>
  );
}
