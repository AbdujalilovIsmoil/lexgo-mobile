import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, StyleSheet } from "react-native";
import { loadGlass } from "@/shared/lib/glass";
import { FLOATING_GLASS, useTheme } from "@/shared/theme";

// The liquid glass of iOS 26, or null where it is not there: before iOS 26, on Android, in a build without the native part, and
// when the person asked for reduced transparency. A caller keeps its solid fallback style and drops it when this is not null.
export function useGlass(always = false) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let live = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((v) => { if (live) setReduce(v); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduce);
    return () => { live = false; sub.remove(); };
  }, []);
  return Platform.OS === "ios" && !reduce && (always || FLOATING_GLASS) ? loadGlass() : null;
}

type Props = { radius: number; tint?: string; interactive?: boolean; clear?: boolean; scheme?: "light" | "dark"; always?: boolean }; // scheme: force a tone (over a dark hero)

// A glass layer that fills its parent (render it first inside a View whose own background is transparent). Only for the layer that
// floats over content — controls, sheets, dialogs, toasts — never for cards in a list.
export function GlassBackdrop({ radius, tint, interactive, clear, scheme, always }: Props) {
  const G = useGlass(always);
  const { dark } = useTheme();
  if (!G) return null;
  return <G.View pointerEvents="none" glassEffectStyle={clear ? "clear" : "regular"} isInteractive={interactive} colorScheme={scheme ?? (dark ? "dark" : "light")} tintColor={tint} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />;
}
