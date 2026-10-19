import { Platform, StatusBar } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

// Expo Go on some Android builds is not edge-to-edge and reports 0 insets,
// which glues content to the status bar and to the navigation bar. Guarantee
// a small gap on both edges there.
const ANDROID_MIN_TOP = 14;
const ANDROID_MIN_BOTTOM = 12;

export function useInsets(): EdgeInsets {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== "android") return insets;
  // Before the first native inset report the top is 0: use the system status bar height so the
  // header does not jump down when the real value arrives.
  const top = insets.top > 0 ? insets.top : StatusBar.currentHeight ?? 0;
  return {
    ...insets,
    top: top < ANDROID_MIN_TOP ? top + ANDROID_MIN_TOP : top,
    bottom: insets.bottom < ANDROID_MIN_BOTTOM ? insets.bottom + ANDROID_MIN_BOTTOM : insets.bottom,
  };
}

// Every page header (tab TopBar, stack Header, hero rows) starts HEADER_GAP below
// the status bar and its row is HEADER_ROW tall, so the controls sit at exactly
// the same spot when you move between pages.
export const HEADER_GAP = 8;
export const HEADER_ROW = 44;
