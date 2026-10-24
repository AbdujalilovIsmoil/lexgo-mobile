import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type S = { open: boolean; toggle: () => void; set: (open: boolean) => void };

// Whether the tablet's docked sidebar is out; remembered per device.
export const useDock = create<S>()(
  persist(
    (set) => ({ open: true, toggle: () => set((s) => ({ open: !s.open })), set: (open) => set({ open }) }),
    { name: "lexgo_dock", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
