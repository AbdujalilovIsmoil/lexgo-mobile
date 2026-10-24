import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { RobotView } from "@/shared/robot/RobotView";
import { useRobotWave } from "@/shared/robot/useRobotWave";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { AI_IDS, useGlobalTarget } from "@/shared/instructor";
import { openInstructor } from "@/features/instructor";
import { LauncherHint } from "./LauncherHint";
import { useLauncherPos, type Side } from "./useLauncherPos";

const W = 104;
const H = 118;
const SIZE = H;

type Props = { base: number; hidden?: boolean }; // base: distance of the resting position from the bottom edge

// The floating LexGo robot: tap makes it wave and opens the assistant screen, drag parks it on either edge. `hidden` (the keyboard is up,
// a screen without the robot, the assistant open) only hides and pauses it: the WebView and its 3D scene stay, so coming back is instant
// instead of a new WebView that loads three.js and the 4.7 MB model again.
export function InstructorLauncher({ base, hidden = false }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const { width: WW, height: HH } = useWindowDimensions();
  const { pos, save } = useLauncherPos();
  const target = useGlobalTarget(AI_IDS.launcher, { label: t("ax2.title"), type: "button" });
  const { ref: robot, wave } = useRobotWave(openInstructor);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const lift = Math.min(Math.max(pos.lift, 0), HH - base - insets.top - SIZE - 24);
  const drop = (cx: number, up: number) => {
    const side: Side = cx < WW / 2 ? "left" : "right";
    save({ side, lift: Math.max(0, Math.min(HH - base - insets.top - SIZE - 24, lift + up)) });
  };
  const pan = Gesture.Pan()
    .minDistance(8)
    .onUpdate((e) => {
      dx.value = e.translationX;
      dy.value = e.translationY;
    })
    .onEnd((e) => {
      const cx = (pos.side === "right" ? WW - 16 - W / 2 : 16 + W / 2) + e.translationX;
      scheduleOnRN(drop, cx, -e.translationY);
      dx.value = 0;
      dy.value = 0;
    });
  const tap = Gesture.Tap().onEnd(() => scheduleOnRN(wave));
  const move = useAnimatedStyle(() => ({ transform: [{ translateX: dx.value }, { translateY: dy.value }, { scale: withSpring(dx.value || dy.value ? 1.08 : 1) }] }));
  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "box-none"}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
      style={[s.wrap, { bottom: base + lift }, pos.side === "right" ? { right: 16 } : { left: 16 }, move, hidden && s.away]}
    >
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View {...(hidden ? {} : target)} accessibilityRole="button" accessibilityLabel={t("ax2.launcher")} style={s.btn}>
          <RobotView ref={robot} width={W} height={H} paused={hidden} />
        </Animated.View>
      </GestureDetector>
      {hidden ? null : <LauncherHint side={pos.side} />}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", width: W, height: H },
  btn: { width: W, height: H },
  away: { opacity: 0 },
});
