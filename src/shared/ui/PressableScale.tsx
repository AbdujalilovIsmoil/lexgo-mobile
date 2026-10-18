import { type ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { tapHaptic } from "@/shared/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scale?: number;
  haptic?: boolean;
};

// .btn:active{transform:scale(.97)} — the web's press feedback, with a spring (none when the system asks for reduced motion).
// Anything pressable is announced as a button unless it says otherwise, and its disabled state is passed on.
export function PressableScale({ children, style, scale = 0.97, haptic = true, onPressIn, onPressOut, onPress, ...rest }: Props) {
  const s = useSharedValue(1);
  const calm = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  // Reanimated shared values are mutated by design; the compiler rule can't see that.
  // eslint-disable-next-line react-hooks/immutability
  const press = (to: number) => (s.value = calm ? 1 : withSpring(to, { damping: 18, stiffness: 320 }));
  return (
    <AnimatedPressable
      accessibilityRole={onPress ? "button" : undefined}
      {...rest}
      accessibilityState={{ disabled: !!rest.disabled, ...rest.accessibilityState }}
      style={[animated, style]}
      onPressIn={(e) => {
        press(scale);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        press(1);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tapHaptic();
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
