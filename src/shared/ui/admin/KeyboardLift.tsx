import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

// Lifts its content above the keyboard by the keyboard's height. Unlike
// KeyboardAvoidingView it does not depend on where the view sits on screen, so it also
// works under an admin header (a KAV measures its offset from its parent, not the screen).
export function KeyboardLift({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { height } = useReanimatedKeyboardAnimation(); // 0 … -keyboardHeight
  const lift = useAnimatedStyle(() => ({ paddingBottom: -height.value }));
  return <Animated.View style={[{ flex: 1 }, style, lift]}>{children}</Animated.View>;
}
