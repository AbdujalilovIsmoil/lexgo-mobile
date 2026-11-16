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
    ios: ios("#0B1A33", 6, 12, 0.07), // Adliya: 0 10px 24px -18px rgba(11,26,51,.25)
    android: { elevation: 0 },
    default: {},
  })!,
  s2: Platform.select<ViewStyle>({
    ios: ios("#0A1F44", 12, 22, 0.18),
    android: { elevation: 4 },
    default: {},
  })!,
  blue: Platform.select<ViewStyle>({
    ios: ios("#1D4ED8", 10, 18, 0.35),
    android: { elevation: 0 },
    default: {},
  })!,
} as const;
