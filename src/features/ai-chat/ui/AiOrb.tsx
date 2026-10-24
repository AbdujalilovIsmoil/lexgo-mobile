import { useEffect, useMemo } from "react";
import { Canvas, Circle, Group, RadialGradient, Skia, vec } from "@shopify/react-native-skia";
import { useDerivedValue, useFrameCallback, useSharedValue, withTiming } from "react-native-reanimated";
import { useIsFocused } from "expo-router";
import { OrbBlob } from "./OrbBlob";

type Props = { size: number; busy?: boolean };

const BLOBS = ["rgba(0,207,232,0.95)", "rgba(46,139,255,0.95)", "rgba(190,240,255,0.8)"];

// The assistant's living orb: a glowing sphere with light swirling inside.
// Spins up while the assistant is answering; sleeps when the tab is hidden.
export function AiOrb({ size, busy = false }: Props) {
  const focused = useIsFocused();
  const phase = useSharedValue(0);
  const speed = useSharedValue(1);
  const idle = useSharedValue(0);
  // ~30 fps is plenty for a slow swirl and halves the work of redrawing the canvas.
  const frame = useFrameCallback((f) => {
    idle.value += f.timeSincePreviousFrame ?? 16;
    if (idle.value < 30) return;
    phase.value += (idle.value / 1000) * speed.value;
    idle.value = 0;
  }, false);
  useEffect(() => {
    frame.setActive(focused);
  }, [focused, frame]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    speed.value = withTiming(busy ? 3.2 : 1, { duration: 500 });
  }, [busy, speed]);

  const c = size / 2;
  const core = size * 0.3;
  const clip = useMemo(() => Skia.Path.Make().addCircle(c, c, core), [c, core]);
  const glow = useDerivedValue(() => size * (0.46 + 0.035 * Math.sin(phase.value * 1.6)));

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle cx={c} cy={c} r={glow}>
        <RadialGradient c={vec(c, c)} r={size / 2} colors={["rgba(0,207,232,0.38)", "rgba(22,104,240,0.14)", "rgba(3,16,43,0)"]} positions={[0, 0.55, 1]} />
      </Circle>
      <Circle cx={c} cy={c} r={core}>
        <RadialGradient c={vec(c - size * 0.07, c - size * 0.09)} r={size * 0.4} colors={["#BDF2FF", "#3AA0FF", "#1043C8", "#06185A"]} positions={[0, 0.35, 0.75, 1]} />
      </Circle>
      <Group clip={clip}>
        {BLOBS.map((color, i) => (
          <OrbBlob key={i} phase={phase} size={size} i={i} color={color} />
        ))}
      </Group>
      <Circle cx={c} cy={c} r={core} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.3)" />
    </Canvas>
  );
}
