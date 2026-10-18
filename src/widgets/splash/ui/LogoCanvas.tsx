import { Canvas, Group, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { LOGO_SIZE, SHAPES } from "../model/logoPaths";
import type { useSplashTimeline } from "../model/useSplashTimeline";
import { LogoLayer } from "./LogoLayer";

type Props = {
  size: number;
  t: ReturnType<typeof useSplashTimeline>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
};

// The logo canvas. It pops in, floats gently and tilts with the finger.
export function LogoCanvas({ size, t, tx, ty }: Props) {
  const k = size / LOGO_SIZE;
  const transform = useDerivedValue(() => {
    const float = Math.sin(t.time.value * Math.PI * 16) * 5;
    return [
      { translateX: tx.value * 16 },
      { translateY: ty.value * 16 + float },
      { rotate: tx.value * 0.08 },
      { scale: t.pop.value },
    ];
  });
  return (
    <Canvas style={{ width: size, height: size }}>
      <Group transform={transform} origin={vec(size / 2, size / 2)}>
        <Group transform={[{ scale: k }]}>
          {SHAPES.map((shape, i) => (
            <LogoLayer key={shape.key} shape={shape} draw={t.draws[i]} strokeOp={t.strokeOp} fill={t.fill} shine={t.shine} />
          ))}
        </Group>
      </Group>
    </Canvas>
  );
}
