import { Platform, type ViewStyle } from "react-native";

// --s1 / --s2 / --sblue from globals.css, approximated for native shadows.
const ios = (color: string, y: number, blur: number, opacity: number): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: y },
  shadowRadius: blur,
  shadowOpacity: opacity,
});

export const shadows = {
  s1: Platform.select<ViewStyle>({
    ios: ios("#0B1F45", 1, 3, 0.06),
    android: { elevation: 1 },
    default: {},
  })!,
  s2: Platform.select<ViewStyle>({
    ios: ios("#0B1F45", 10, 18, 0.16),
    android: { elevation: 4 },
    default: {},
  })!,
  blue: Platform.select<ViewStyle>({
    ios: ios("#1668F0", 10, 18, 0.4),
    android: { elevation: 6, shadowColor: "#1668F0" },
    default: {},
  })!,
} as const;
