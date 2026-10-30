import { type ReactNode } from "react";
import { Platform } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "expo-router";
import { AURORA, useTheme } from "@/shared/theme";

// Feeds our palette to React Navigation so screen backgrounds never flash white.
export function NavigationTheme({ children }: { children: ReactNode }) {
  const { colors, dark, glass } = useTheme();
  const base = dark ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: glass || (Platform.OS === "ios" && AURORA) ? "transparent" : colors.bg, card: colors.surface, text: colors.ink, border: colors.line, primary: colors.accent },
  };
  return <NavThemeProvider value={theme}>{children}</NavThemeProvider>;
}
