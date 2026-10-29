import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { selectHaptic } from "@/shared/lib/haptics";
import { useTheme } from "@/shared/theme";
import { LiquidGlass, useLiquidGlass } from "@/shared/ui";

const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };
const GROW = 0.16; // how much the lens swells while it is held

type Box = { width: number; height: number; pad: number; count: number };

// The iOS 26 selection lens of the floating bar: a glass pill behind the active tab that you can grab and slide along the bar; it swells
// while held and settles on the tab under the finger when let go, which then opens. A plain tap on a tab never starts it (8 pt slop).
export function useTabLens({ width, height, pad, count }: Box, active: number, onPick: (i: number) => void) {
  const slot = count ? (width - pad * 2) / count : 0;
  const x = useSharedValue(pad + Math.max(active, 0) * slot);
  const held = useSharedValue(0);
  useEffect(() => { if (active >= 0 && slot) x.set(withSpring(pad + active * slot, SPRING)); }, [active, slot, pad, x]);
  const pick = (i: number) => { selectHaptic(); onPick(i); };
  const gesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .enabled(slot > 0)
    .onStart(() => { held.set(withSpring(1, SPRING)); })
    .onUpdate((e) => { x.set(Math.min(Math.max(e.x - slot / 2, pad), width - pad - slot)); })
    .onEnd((e) => {
      const i = Math.min(Math.max(Math.floor((e.x - pad) / slot), 0), count - 1);
      x.set(withSpring(pad + i * slot, SPRING));
      scheduleOnRN(pick, i);
    })
    .onFinalize(() => { held.set(withSpring(0, SPRING)); });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }, { scale: 1 + held.get() * GROW }] }));
  const lens = slot ? <Lens style={style} width={slot} height={height} visible={active >= 0} /> : null;
  return { gesture, lens };
}

function Lens({ style, width, height, visible }: { style: object; width: number; height: number; visible: boolean }) {
  const glass = useLiquidGlass();
  const { dark } = useTheme();
  const box = { width: width - 4, height: height - 8, borderRadius: (height - 8) / 2, marginLeft: 2, opacity: visible ? 1 : 0 };
  return (
    <Animated.View pointerEvents="none" style={[s.lens, box, !glass && { backgroundColor: dark ? "rgba(255,255,255,0.10)" : "rgba(11,31,69,0.07)" }, style]}>
      {glass ? <LiquidGlass width={box.width} height={box.height} interactive tint={dark ? "rgba(255,255,255,0.08)" : "rgba(11,31,69,0.06)"} /> : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({ lens: { position: "absolute", left: 0, top: 4, overflow: "hidden" } });
