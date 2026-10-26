import { useEffect, useMemo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Circle, Path, Skia, SweepGradient, vec } from "@shopify/react-native-skia";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useMotionOn } from "@/shared/lib/useMotionOn";
import { useColors } from "@/shared/theme";

type Props = {
  value: number; // 0..1
  color: string;
  size?: number;
  stroke?: number;
  label: string;
  /** A thin halo around the ring with a light that keeps circling it (a call to finish something). */
  halo?: boolean;
  children?: ReactNode;
};

const TURN_MS = 3200;

// Full-circle progress ring: the arc sweeps in when it appears, the centre holds the percent or a check. The halo's light turns only on the
// page in view, with the app in front and without Reduce Motion; it is a rotation of a picture drawn once, so the GPU turns it and nothing
// is drawn again frame by frame.
export function ProgressRing({ value, color, size = 96, stroke = 9, label, halo, children }: Props) {
  const c = useColors();
  const p = useSharedValue(0);
  const turn = useSharedValue(0);
  const motion = useMotionOn();
  const haloW = halo ? Math.max(2, Math.round(stroke * 0.34)) : 0;
  const inset = halo ? haloW + Math.round(stroke * 0.55) : 0; // the ring sits inside the halo with a small gap
  const ring = size - inset * 2;
  const arc = useMemo(() => {
    const path = Skia.Path.Make();
    path.addArc({ x: inset + stroke / 2, y: inset + stroke / 2, width: ring - stroke, height: ring - stroke }, -90, 359.9);
    return path;
  }, [inset, ring, stroke]);
  useEffect(() => {
    p.value = withTiming(Math.min(Math.max(value, 0), 1), { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [value, p]);
  useEffect(() => {
    if (!halo || !motion) return;
    turn.value = 0;
    turn.value = withRepeat(withTiming(360, { duration: TURN_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(turn);
  }, [halo, motion, turn]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  const mid = size / 2;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={{ width: size, height: size }}>
      {halo ? (
        <Animated.View style={[StyleSheet.absoluteFill, spin]} pointerEvents="none">
          <Canvas style={{ width: size, height: size }}>
            <Circle cx={mid} cy={mid} r={mid - haloW / 2} style="stroke" strokeWidth={haloW} color={`${color}22`} />
            <Circle cx={mid} cy={mid} r={mid - haloW / 2} style="stroke" strokeWidth={haloW} strokeCap="round">
              <SweepGradient c={vec(mid, mid)} colors={["#FFFFFF00", "#FFFFFF00", `${color}55`, color, "#FFFFFF"]} positions={[0, 0.55, 0.8, 0.97, 1]} />
            </Circle>
          </Canvas>
        </Animated.View>
      ) : null}
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={c.surface2} />
        <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={color} start={0} end={p} />
      </Canvas>
      <View style={s.center} pointerEvents="none">{children}</View>
    </View>
  );
}

const s = StyleSheet.create({ center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" } });
