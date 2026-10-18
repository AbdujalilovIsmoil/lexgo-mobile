import { useEffect } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useInsets } from "@/shared/lib/insets";
import { finishStep, useOverlay } from "@/features/instructor";
import { OverlayBubble } from "./OverlayBubble";
import { useTargetRect } from "./useTargetRect";

const DIM = "rgba(2,10,28,0.62)";
const PAD = 6;
const RING = "#5FD9FF";

function Ring({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [p]);
  const pulse = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * p.value, transform: [{ scale: 1 + 0.035 * p.value }] }));
  return <Animated.View pointerEvents="none" style={[s.ring, { left: x, top: y, width: w, height: h }, pulse]} />;
}

// Spotlight on a registered target: the rest of the screen is dimmed (tap = next), the hole stays live so
// the highlighted control can be pressed, an animated ring marks it and a caption card explains.
export function HighlightOverlay() {
  const step = useOverlay((o) => o.step);
  const { width: W, height: H } = useWindowDimensions();
  const insets = useInsets();
  const rect = useTargetRect(step && step.targetId ? step.targetId : null);
  if (!step) return null;
  if (!step.targetId || !rect) {
    return (
      <View style={s.fill} pointerEvents="box-none">
        <OverlayBubble step={step} above offset={insets.bottom + 24} />
      </View>
    );
  }
  const x = Math.max(0, rect.x - PAD);
  const y = Math.max(0, rect.y - PAD);
  const w = Math.min(W - x, rect.width + 2 * PAD);
  const h = rect.height + 2 * PAD;
  const above = y + h / 2 > H * 0.55;
  const next = () => finishStep("next");
  return (
    <Animated.View entering={FadeIn.duration(180)} style={s.fill} pointerEvents="box-none">
      <Pressable onPress={next} style={{ position: "absolute", left: 0, right: 0, top: 0, height: y, backgroundColor: DIM }} />
      <Pressable onPress={next} style={{ position: "absolute", left: 0, right: 0, top: y + h, bottom: 0, backgroundColor: DIM }} />
      <Pressable onPress={next} style={{ position: "absolute", left: 0, width: x, top: y, height: h, backgroundColor: DIM }} />
      <Pressable onPress={next} style={{ position: "absolute", left: x + w, right: 0, top: y, height: h, backgroundColor: DIM }} />
      <Ring x={x} y={y} w={w} h={h} />
      <OverlayBubble step={step} above={above} offset={above ? H - y + 14 : y + h + 14} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  fill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  ring: { position: "absolute", borderRadius: 16, borderWidth: 3, borderColor: RING, shadowColor: RING, shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
});
