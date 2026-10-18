import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, LinearGradient, Path, Skia, vec } from "@shopify/react-native-skia";
import { Text } from "@/shared/ui";
import { initials } from "@/shared/lib/format";
import { brand, useColors } from "@/shared/theme";

// The web's .mk-mono: initials on a brand-gradient disc inside a ring whose blue arc is the rating (5.0 = full circle).
export function Monogram({ name, rating, size = 58, ring = true }: { name: string; rating: number; size?: number; ring?: boolean }) {
  const c = useColors();
  const sweep = ring ? (Math.max(0, Math.min(5, rating)) / 5) * 360 : 0;
  const w = 3;
  const arc = useMemo(() => Skia.Path.Make().addArc({ x: w / 2, y: w / 2, width: size - w, height: size - w }, -90, Math.max(sweep, 0.01)), [size, sweep]);
  const track = useMemo(() => Skia.Path.Make().addCircle(size / 2, size / 2, (size - w) / 2), [size]);
  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={track} style="stroke" strokeWidth={w} color={c.line} />
        {sweep > 0 ? <Path path={arc} style="stroke" strokeWidth={w} strokeCap="round"><LinearGradient start={vec(0, 0)} end={vec(size, size)} colors={[brand.cy, brand.b600]} /></Path> : null}
        <Path path={Skia.Path.Make().addCircle(size / 2, size / 2, (size - w * 2) / 2)} style="fill"><LinearGradient start={vec(0, 0)} end={vec(size, size)} colors={[brand.b600, brand.cy]} /></Path>
      </Canvas>
      <View style={s.in}><Text style={{ color: "#FFFFFF", fontFamily: "Onest_800ExtraBold", fontSize: size * 0.34, lineHeight: size * 0.44 }}>{initials(name) || "LG"}</Text></View>
    </View>
  );
}

const s = StyleSheet.create({ in: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" } });
