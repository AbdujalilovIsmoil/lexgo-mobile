import { BlurMask, Group, LinearGradient, Path, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import type { LogoShape } from "../model/logoPaths";

type Props = {
  shape: LogoShape;
  draw: SharedValue<number>;
  strokeOp: SharedValue<number>;
  fill: SharedValue<number>;
  shine: SharedValue<number>;
};

const SHINE = ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)", "rgba(255,255,255,0)"];

// One logo shape: glowing outline that draws itself, then the gradient fill,
// then a diagonal light band that sweeps across.
export function LogoLayer({ shape, draw, strokeOp, fill, shine }: Props) {
  const a = useDerivedValue(() => vec(shine.value - 240, 0));
  const b = useDerivedValue(() => vec(shine.value + 240, 300));
  return (
    <Group>
      <Path path={shape.d} style="stroke" strokeWidth={18} color="#6FE0FF" start={0} end={draw} opacity={strokeOp}>
        <BlurMask blur={20} style="solid" />
      </Path>
      <Path path={shape.d} style="stroke" strokeWidth={5} strokeJoin="round" strokeCap="round" color="#EAFBFF" start={0} end={draw} opacity={strokeOp} />
      <Path path={shape.d} opacity={fill}>
        <LinearGradient start={vec(shape.from[0], shape.from[1])} end={vec(shape.to[0], shape.to[1])} colors={shape.colors} positions={shape.positions} />
      </Path>
      <Path path={shape.d} opacity={fill}>
        <LinearGradient start={a} end={b} colors={SHINE} />
      </Path>
    </Group>
  );
}
