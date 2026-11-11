import { Canvas, Group, Path } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { BOX, MARK, MARK_COLORS } from "../model/logoPaths";

type Props = {
  w: number;
  h: number;
  size: number; // must match "imageWidth" of expo-splash-screen in app.json
  exit: SharedValue<number>;
  reduceMotion: boolean;
};

const ZOOM = 14; // how far the mark flies towards the viewer on exit

// The mark on a full-screen canvas, so the exit zoom stays vector-sharp (scaling a small
// canvas view would blow up its bitmap). It sits exactly where the native splash draws
// assets/splash-logo.png (centred, imageWidth wide), so the hand-over is invisible.
export function LogoCanvas({ w, h, size, exit, reduceMotion }: Props) {
  const k = size / BOX.size;
  const transform = useDerivedValue(() => {
    const s = (reduceMotion ? 1 : 1 + (ZOOM - 1) * exit.value) * k;
    return [
      { translateX: w / 2 },
      { translateY: h / 2 },
      { scale: s },
      { translateX: -(BOX.x + BOX.size / 2) },
      { translateY: -(BOX.y + BOX.size / 2) },
    ];
  });
  return (
    <Canvas style={{ width: w, height: h }} pointerEvents="none">
      <Group transform={transform}>
        <Path path={MARK.shield} color={MARK_COLORS.base} />
        <Path path={MARK.t} color={MARK_COLORS.base} />
        <Path path={MARK.h} color={MARK_COLORS.accent} />
        <Path path={MARK.swoosh} color={MARK_COLORS.accent} />
      </Group>
    </Canvas>
  );
}
