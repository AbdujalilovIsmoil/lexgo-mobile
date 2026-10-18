import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Side } from "./useLauncherPos";

let shown = false; // once per app run: a nudge, not a nag

// A small speech pill beside the assistant orb that appears once, a few seconds after launch.
export function LauncherHint({ side }: { side: Side }) {
  const { t } = useT();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (shown) return;
    const a = setTimeout(() => { shown = true; setOn(true); }, 2500);
    const b = setTimeout(() => setOn(false), 7500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (!on) return null;
  return (
    <Animated.View entering={FadeInRight.duration(280)} exiting={FadeOutRight.duration(220)} pointerEvents="none" style={[s.pill, side === "right" ? { right: 100 } : { left: 100 }]}>
      <Text variant="caption" weight="bold" tone="white" numberOfLines={1}>{t("ax2.hint")}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({ pill: { position: "absolute", top: 22, backgroundColor: "#0B1E4A", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(95,217,255,0.5)" } });
