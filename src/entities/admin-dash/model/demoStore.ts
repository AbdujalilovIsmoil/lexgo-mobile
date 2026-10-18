import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// "Show demo data" switch of the dashboards (the web keeps it in localStorage `lexgo_demo_stats`).
export const useDemoStore = create<{ forced: boolean; setForced: (on: boolean) => void }>()(
  persist((set) => ({ forced: false, setForced: (forced) => set({ forced }) }), { name: "lexgo_demo_stats", storage: createJSONStorage(() => AsyncStorage) }),
);
