import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useMotionOn } from "@/shared/lib/useMotionOn";

const EDGE = 1.5; // the rim's width: the light runs in it
const TURN_MS = 3200;

type Props = { radius: number; rest: string; children: ReactNode; style?: StyleProp<ViewStyle> };

// A rounded rim with a violet-to-cyan light running round it: a gradient streak turning behind the content, seen only through the
// EDGE-wide rim. It turns while its screen is on view (useMotionOn); otherwise the rim rests in `rest`.
export function RunningRim({ radius, rest, children, style }: Props) {
  const on = useMotionOn();
  const [box, setBox] = useState({ w: 0, h: 0 });
  const turn = useSharedValue(0);
  useEffect(() => {
    if (!on) return;
    turn.set(withRepeat(withTiming(turn.get() + 1, { duration: TURN_MS, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(turn);
  }, [on, turn]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 360}deg` }] }));
  const side = Math.hypot(box.w, box.h);
  return (
    <View onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={[{ borderRadius: radius, padding: EDGE, overflow: "hidden", backgroundColor: rest }, style]}>
      {side ? (
        <Animated.View pointerEvents="none" style={[s.spinner, { width: side, height: side, left: (box.w - side) / 2, top: (box.h - side) / 2 }, spin]}>
          <LinearGradient colors={[rest, rest, "#8B6CF2", "#00CFE8", "#5B9BFF", rest, rest]} locations={[0, 0.38, 0.46, 0.5, 0.54, 0.62, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({ spinner: { position: "absolute" } });
