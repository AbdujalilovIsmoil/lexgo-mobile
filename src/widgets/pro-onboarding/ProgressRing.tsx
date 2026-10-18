import { useEffect, useMemo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { useColors } from "@/shared/theme";

type Props = { value: number; color: string; size?: number; stroke?: number; label: string; children?: ReactNode };

// Full-circle progress ring (value 0..1) that sweeps when it appears; the centre holds the percent or a check.
export function ProgressRing({ value, color, size = 96, stroke = 9, label, children }: Props) {
  const c = useColors();
  const p = useSharedValue(0);
  const arc = useMemo(() => {
    const path = Skia.Path.Make();
    path.addArc({ x: stroke / 2, y: stroke / 2, width: size - stroke, height: size - stroke }, -90, 359.9);
    return path;
  }, [size, stroke]);
  useEffect(() => { p.value = withTiming(Math.min(Math.max(value, 0), 1), { duration: 800, easing: Easing.out(Easing.cubic) }); }, [value, p]);
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={{ width: size, height: size }}>
      <Canvas style={{ width: size, height: size }}>
        <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={c.surface2} />
        <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={color} start={0} end={p} />
      </Canvas>
      <View style={s.center} pointerEvents="none">{children}</View>
    </View>
  );
}

const s = StyleSheet.create({ center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" } });
