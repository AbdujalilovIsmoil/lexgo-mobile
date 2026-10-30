import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { darkColors, glassColors, lightColors, type ThemeColors } from "./colors";
import { useThemeStore } from "./themeStore";

// `dark`: light type on a dark ground (the dark and the glass themes); `glass`: the glass theme — translucent panes over GlassBackdrop.
export type Theme = { colors: ThemeColors; dark: boolean; glass: boolean };

const ThemeCtx = createContext<Theme>({ colors: lightColors, dark: false, glass: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const glass = mode === "glass";
  const dark = glass || (mode === "system" ? system === "dark" : mode === "dark");
  const value = useMemo<Theme>(() => ({ colors: glass ? glassColors : dark ? darkColors : lightColors, dark, glass }), [dark, glass]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
export const useColors = () => useContext(ThemeCtx).colors;
