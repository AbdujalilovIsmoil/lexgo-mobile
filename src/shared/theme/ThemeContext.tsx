import { createContext, useContext, useMemo, type ReactNode } from "react";
import { GLASS_SOLID, darkColors, glassColors, lightColors, type ThemeColors } from "./colors";
import { useThemeStore } from "./themeStore";

// `dark`: light type on a dark ground (the dark and the glass themes); `glass`: the glass theme — translucent panes over GlassBackdrop.
export type Theme = { colors: ThemeColors; dark: boolean; glass: boolean };

const ThemeCtx = createContext<Theme>({ colors: lightColors, dark: false, glass: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const glass = mode === "glass";
  const dark = glass || mode === "dark";
  const value = useMemo<Theme>(() => ({ colors: glass ? glassColors : dark ? darkColors : lightColors, dark, glass }), [dark, glass]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
export const useColors = () => useContext(ThemeCtx).colors;
// The ground of a layer that floats over the page (a sheet, a dialog, a toast, a full-screen gate): `surface` — except in the glass theme,
// whose surface is a see-through pane that would let the page show through, so a solid navy there.
export const usePaneColor = () => { const { colors, glass } = useContext(ThemeCtx); return glass ? GLASS_SOLID : colors.surface; };
