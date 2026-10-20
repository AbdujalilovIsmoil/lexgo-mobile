import type { ComponentType } from "react";
import type { ViewProps } from "react-native";

type GlassProps = ViewProps & { glassEffectStyle?: "clear" | "regular" | "none"; tintColor?: string; isInteractive?: boolean; colorScheme?: "auto" | "light" | "dark" };
type Glass = { View: ComponentType<GlassProps>; available: boolean };

// expo-glass-effect has a native part. A build made before it was added does not contain it, and importing it up front makes the
// whole app crash at start-up: load it on first use, and treat "not there" like "not iOS 26" (the bar falls back to the blur).
let cached: Glass | null | undefined;
export function loadGlass(): Glass | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("expo-glass-effect") as typeof import("expo-glass-effect");
    cached = m.isLiquidGlassAvailable() ? { View: m.GlassView as ComponentType<GlassProps>, available: true } : null;
  } catch {
    cached = null;
  }
  return cached;
}
