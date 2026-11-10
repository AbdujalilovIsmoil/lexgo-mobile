import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "glass";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

// The theme until the user picks one: always light. The phone's own (system) theme is never looked at.
const DEFAULT_MODE: ThemeMode = "light";

// Light, dark or the app's glass theme, persisted per device. There is no "follow the phone" mode: a saved one (version 0) or anything
// unknown becomes light.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: DEFAULT_MODE,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "lexgo_theme",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (saved) => {
        const mode = (saved as { mode?: string } | undefined)?.mode;
        return { mode: mode === "light" || mode === "dark" || mode === "glass" ? mode : DEFAULT_MODE } as ThemeState;
      },
    },
  ),
);
