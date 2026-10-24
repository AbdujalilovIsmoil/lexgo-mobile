import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { GradientBox, PressableScale, Text } from "@/shared/ui";
import type { DashCtx } from "../lib/useDashCtx";
import { Sparkline } from "./Sparkline";
import { selectHaptic } from "@/shared/lib/haptics";

type HeroCtx = Pick<DashCtx, "fmt" | "c" | "trend" | "t">;
const W_PAD = 20;

// Big revenue card: tap opens the breakdown, dragging over the chart scrubs day by day.
export function RevenueHero({ x, onOpen, width, tall }: { x: HeroCtx; onOpen?: () => void; width: number; tall?: boolean }) {
  const { fmt, c, trend, t } = x;
  const [idx, setIdx] = useState<number | null>(null);
  const w = Math.max(width - W_PAD * 2, 1);
  const pick = (px: number) => {
    const i = Math.round((Math.min(Math.max(px, 0), w) / w) * Math.max(trend.length - 1, 0));
    setIdx((p) => { if (p !== i) selectHaptic(); return i; });
  };
  const pan = Gesture.Pan().activeOffsetX([-6, 6]).onStart((e) => runOnJS(pick)(e.x)).onUpdate((e) => runOnJS(pick)(e.x)).onEnd(() => runOnJS(setIdx)(null));
  const p = idx != null ? trend[idx] : null;
  const delta = c?.revenueDeltaPct;
  return (
    <PressableScale onPress={onOpen} scale={0.985}>
      <GradientBox style={s.box}>
        <Text variant="caption" style={s.kicker}>{p ? p.label.slice(0, 10) : t("admDashC.crm.revenue")}</Text>
        <Text variant="h2" tone="white" numberOfLines={1} adjustsFontSizeToFit style={s.big}>{p ? fmt.short(p.value) : fmt.short(c?.revenue)}</Text>
        {delta && !p ? <View style={s.pill}><Text variant="caption" weight="bold" tone="white">{delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</Text></View> : null}
        {trend.length > 1 ? <GestureDetector gesture={pan}><View style={s.chart}><Sparkline values={trend.map((q) => q.value)} width={w} height={tall ? 170 : 86} active={idx} /></View></GestureDetector> : null}
      </GradientBox>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  box: { padding: W_PAD, gap: 4, minHeight: 190 },
  big: { fontSize: 36, lineHeight: 42 },
  kicker: { color: "#CFE3FF" },
  pill: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  chart: { marginTop: 10 },
});
