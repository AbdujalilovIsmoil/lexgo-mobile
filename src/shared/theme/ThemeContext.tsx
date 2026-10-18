import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./colors";
import { useThemeStore } from "./themeStore";

export type Theme = { colors: ThemeColors; dark: boolean };

const ThemeCtx = createContext<Theme>({ colors: lightColors, dark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const dark = mode === "system" ? system === "dark" : mode === "dark";
  const value = useMemo<Theme>(() => ({ colors: dark ? darkColors : lightColors, dark }), [dark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
export const useColors = () => useContext(ThemeCtx).colors;
