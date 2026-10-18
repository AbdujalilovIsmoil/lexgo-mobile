import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Icon } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";

const REACH = 56;

// Swipe a message to the right to answer it (the icon follows the finger; past REACH it fires once).
export function SwipeReply({ enabled, onReply, children }: { enabled: boolean; onReply: () => void; children: ReactNode }) {
  const x = useSharedValue(0);
  const fire = () => {
    tapHaptic();
    onReply();
  };
  const pan = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-999, 14])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      x.value = Math.min(REACH + 14, Math.max(0, e.translationX));
    })
    .onEnd(() => {
      if (x.value >= REACH) scheduleOnRN(fire);
      x.value = withSpring(0, { damping: 20, stiffness: 260 });
    });
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const hint = useAnimatedStyle(() => ({ opacity: Math.min(1, x.value / REACH), transform: [{ scale: 0.6 + Math.min(1, x.value / REACH) * 0.4 }] }));
  return (
    <GestureDetector gesture={pan}>
      <View>
        <Animated.View style={[s.hint, hint]}><Icon name="corner-up-left" size={18} tone="accent" /></Animated.View>
        <Animated.View style={slide}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({ hint: { position: "absolute", left: 6, top: 0, bottom: 0, justifyContent: "center" } });
