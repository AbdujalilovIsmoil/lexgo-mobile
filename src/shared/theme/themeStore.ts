import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "glass";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

// What the phone shows right now — the starting theme of a new install, and where an old "follow the phone" choice lands.
const phoneMode = (): ThemeMode => (Appearance.getColorScheme() === "dark" ? "dark" : "light");

// Light, dark or the app's glass theme, persisted per device. There is no "follow the phone" mode any more: a saved one (version 0)
// becomes the theme the phone has when the app starts.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: phoneMode(),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "lexgo_theme",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (saved) => {
        const mode = (saved as { mode?: string } | undefined)?.mode;
        return { mode: mode === "light" || mode === "dark" || mode === "glass" ? mode : phoneMode() } as ThemeState;
      },
    },
  ),
);
