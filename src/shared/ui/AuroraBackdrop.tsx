import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Circle, RadialGradient, Rect, vec } from "@shopify/react-native-skia";
import { useSession } from "@/entities/session";
import { useTheme } from "@/shared/theme";
import { useMemo } from "react";

type Field = { x: number; y: number; r: number; color: string; alpha: number }; // x, y in screen fractions, r in screen widths

// Three large soft colour fields behind every screen (static, drawn once). The role tints one of them: an advocate gets gold, a
// yurist a magenta-violet, everyone else (client, staff) the brand violet.
const LIGHT_BASE: Field[] = [{ x: 0, y: 0.04, r: 0.95, color: "#3FCBF0", alpha: 0.62 }, { x: 1, y: 0.42, r: 1.05, color: "#5E92FF", alpha: 0.66 }, { x: 0.05, y: 0.82, r: 1.0, color: "#A58CFF", alpha: 0.64 }];
const DARK_BASE: Field[] = [{ x: 0, y: 0, r: 1.05, color: "#1668F0", alpha: 0.62 }, { x: 1, y: 0.42, r: 0.85, color: "#7A5CFF", alpha: 0.42 }, { x: 0.1, y: 0.97, r: 0.85, color: "#00CFE8", alpha: 0.3 }];
// The role adds one glow on the right edge, level with the content (not under the tab bar) and clear of the teal field below, so it
// stays gold / magenta instead of mixing into olive.
const LIGHT: Record<"advocate" | "lawyer" | "base", Field[]> = {
  base: LIGHT_BASE,
  advocate: [...LIGHT_BASE, { x: 1, y: 0.72, r: 0.6, color: "#FFB93D", alpha: 0.6 }],
  lawyer: [...LIGHT_BASE, { x: 1, y: 0.72, r: 0.6, color: "#FF7FC0", alpha: 0.55 }],
};
const DARK: Record<"advocate" | "lawyer" | "base", Field[]> = {
  base: DARK_BASE,
  advocate: [...DARK_BASE, { x: 1, y: 0.72, r: 0.6, color: "#FFB93D", alpha: 0.32 }],
  lawyer: [...DARK_BASE, { x: 1, y: 0.72, r: 0.6, color: "#E0457F", alpha: 0.32 }],
};
const BASE = { light: "#EEF4FF", dark: "#060C1B" } as const;
// The glass theme's ground: deep navy with a blue light at the top left and the middle right, and a violet one low down.
const GLASS_BASE = "#0A1430";
const GLASS: Field[] = [{ x: 0, y: 0.05, r: 1.0, color: "#1E55E0", alpha: 0.5 }, { x: 1, y: 0.42, r: 0.95, color: "#2E6BEA", alpha: 0.32 }, { x: 0.1, y: 0.96, r: 0.9, color: "#3B2E9E", alpha: 0.36 }];

const rgba = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

// The same fields as one CSS background, for native containers that cannot sit above the RN root (the system tab bar's pages).
export function useAuroraStyle() {
  const { dark, glass } = useTheme();
  const { width: W, height: H } = useWindowDimensions();
  const role = useSession()?.user.role;
  const key = role === "advocate" ? "advocate" : role === "lawyer" ? "lawyer" : "base";
  return useMemo(() => {
    const fields = glass ? GLASS : (dark ? DARK : LIGHT)[key];
    // `circle farthest-corner` has no radius of its own: the fade-out stop is the field's radius as a share of the distance to the far corner.
    const image = fields.map((f) => {
      const cx = f.x * W, cy = f.y * H;
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
      const stop = Math.min(100, Math.round((f.r * W / far) * 100));
      return `radial-gradient(circle farthest-corner at ${Math.round(f.x * 100)}% ${Math.round(f.y * 100)}%, ${rgba(f.color, f.alpha)} 0%, ${rgba(f.color, 0)} ${stop}%)`;
    }).join(", ");
    return { backgroundColor: glass ? GLASS_BASE : dark ? BASE.dark : BASE.light, experimental_backgroundImage: image };
  }, [dark, glass, key, W, H]);
}

export function AuroraBackdrop() {
  const { dark, glass } = useTheme();
  const { width, height } = useWindowDimensions();
  const role = useSession()?.user.role;
  const key = role === "advocate" ? "advocate" : role === "lawyer" ? "lawyer" : "base";
  const fields = glass ? GLASS : (dark ? DARK : LIGHT)[key];
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height} color={glass ? GLASS_BASE : dark ? BASE.dark : BASE.light} />
      {fields.map((f, i) => {
        const cx = f.x * width, cy = f.y * height, r = f.r * width;
        return (
          <Circle key={i} cx={cx} cy={cy} r={r}>
            <RadialGradient c={vec(cx, cy)} r={r} colors={[rgba(f.color, f.alpha), rgba(f.color, 0)]} />
          </Circle>
        );
      })}
    </Canvas>
  );
}
