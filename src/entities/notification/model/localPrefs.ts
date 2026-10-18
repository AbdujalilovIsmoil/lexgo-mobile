import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// On-device alert settings (not the server's channel switches): what this phone does when an
// event arrives. `askedAt` / `snoozeUntil` drive the in-context permission card.
type Local = {
  banner: boolean; // in-app banner while the app is open
  background: boolean; // local alerts + periodic check while the app is not in the foreground
  sound: boolean;
  vibrate: boolean;
  askedAt: number;
  snoozeUntil: number;
  patch: (p: Partial<Omit<Local, "patch">>) => void;
};

export const useLocalPrefs = create<Local>()(
  persist(
    (set) => ({ banner: true, background: true, sound: true, vibrate: true, askedAt: 0, snoozeUntil: 0, patch: (p) => set(p) }),
    { name: "lexgo_notif_local", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const localPrefs = () => useLocalPrefs.getState();

// True while the permission card is snoozed (the clock is read in the selector, not during render).
export const useSnoozed = (): boolean => useLocalPrefs((s) => s.snoozeUntil > Date.now());
