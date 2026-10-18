import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { Text } from "./Text";
import { useColors } from "@/shared/theme";

type Props = { value: number; text: string; label: string; color: string; size?: number };

// Half-circle gauge: the arc sweeps to `value` (0..1) when it appears; value text inside, label below.
export function Gauge({ value, text, label, color, size = 148 }: Props) {
  const c = useColors();
  const p = useSharedValue(0);
  const h = size / 2 + 8;
  const arc = useMemo(() => Skia.Path.Make().addArc({ x: 12, y: 12, width: size - 24, height: size - 24 }, 180, 180), [size]);
  useEffect(() => { p.value = withTiming(Math.min(Math.max(value, 0), 1), { duration: 900, easing: Easing.out(Easing.cubic) }); }, [value, p]);
  return (
    <View style={s.box}>
      <View style={{ width: size, height: h }}>
        <Canvas style={{ width: size, height: h }}>
          <Path path={arc} style="stroke" strokeWidth={11} strokeCap="round" color={c.line} />
          <Path path={arc} style="stroke" strokeWidth={11} strokeCap="round" color={color} start={0} end={p} />
        </Canvas>
        <View style={s.center}><Text variant="h3" numberOfLines={1} adjustsFontSizeToFit>{text}</Text></View>
      </View>
      <Text variant="caption" tone="gray" center numberOfLines={2} style={{ width: size }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({ box: { alignItems: "center", gap: 2, flex: 1 }, center: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" } });
