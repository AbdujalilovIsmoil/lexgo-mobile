import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";

type Draft = Record<string, unknown>;
type State = {
  drafts: Record<string, Draft>; // "<userId>:<section>" → unsaved form values
  save: (key: string, value: Draft) => void;
  drop: (key: string) => void;
  wipe: () => void;
};

// Unsaved profile forms survive closing the sheet or the app (TZ 31: drafts are kept locally).
export const useDraftStore = create<State>()(
  persist(
    (set) => ({
      drafts: {},
      save: (key, value) => set((s) => ({ drafts: { ...s.drafts, [key]: value } })),
      drop: (key) => set((s) => ({ drafts: Object.fromEntries(Object.entries(s.drafts).filter(([k]) => k !== key)) })),
      wipe: () => set({ drafts: {} }),
    }),
    { name: "lexgo_pro_drafts", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// Logout / role change must not leak one account's drafts into the next one.
registerSessionReset(() => useDraftStore.getState().wipe());
