import { useIsFocused } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { useAppActive } from "./useAppActive";

/**
 * A decorative loop may run: its screen is the one on view (iOS keeps every tab page mounted, so a loop in a tab header would otherwise run
 * four times over), the app is in front, and the system does not ask for reduced motion. Only for components inside a screen.
 */
export function useMotionOn(): boolean {
  const focused = useIsFocused();
  const active = useAppActive();
  const calm = useReducedMotion();
  return focused && active && !calm;
}
