import { Platform } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

// Expo Go on some Android builds is not edge-to-edge and reports 0 insets,
// which glues content to the status bar and to the navigation bar. Guarantee
// a small gap on both edges there.
const ANDROID_MIN_TOP = 14;
const ANDROID_MIN_BOTTOM = 12;

export function useInsets(): EdgeInsets {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== "android") return insets;
  return {
    ...insets,
    top: insets.top < ANDROID_MIN_TOP ? insets.top + ANDROID_MIN_TOP : insets.top,
    bottom: insets.bottom < ANDROID_MIN_BOTTOM ? insets.bottom + ANDROID_MIN_BOTTOM : insets.bottom,
  };
}
