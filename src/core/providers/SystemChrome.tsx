import { useEffect } from "react";
import { Platform } from "react-native";
import * as SystemUI from "expo-system-ui";
import { NavigationBar } from "expo-navigation-bar";
import { useTheme } from "@/shared/theme";

// Edge-to-edge like iOS: the page colour is painted behind the status bar and
// the Android navigation bar, and screens keep clear of them with inset padding.
export function SystemChrome() {
  const { colors, dark } = useTheme();
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
    if (Platform.OS !== "android") return;
    NavigationBar.setStyle(dark ? "dark" : "light");
  }, [colors.bg, dark]);
  return null;
}
