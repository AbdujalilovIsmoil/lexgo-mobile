import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { Placement } from "./types";

// Where an urgent request that came from a second-opinion promotion came from: the order, its event url and the promotion session that
// created it. Kept across restarts (the payment is approved later, in Telegram) so `purchased` can be sent with the original session.
export type Origin = { orderId: string; eventUrl: string; placement: Placement; session: string; at: number; purchased: boolean };

type State = {
  items: Record<string, Origin>; // urgent request id → origin
  put: (requestId: string, o: Omit<Origin, "at" | "purchased">) => void;
  markPurchased: (requestId: string, v: boolean) => void;
  wipe: () => void;
};

const KEEP = 40;

export const useOriginStore = create<State>()(
  persist(
    (set) => ({
      items: {},
      put: (id, o) => set((s) => {
        const next = { ...s.items, [id]: { ...o, at: Date.now(), purchased: false } };
        const keys = Object.keys(next).sort((a, b) => next[b].at - next[a].at).slice(0, KEEP);
        return { items: Object.fromEntries(keys.map((k) => [k, next[k]])) };
      }),
      markPurchased: (id, v) => set((s) => (s.items[id] ? { items: { ...s.items, [id]: { ...s.items[id], purchased: v } } } : s)),
      wipe: () => set({ items: {} }),
    }),
    { name: "lexgo_so_origin", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

registerSessionReset(() => useOriginStore.getState().wipe());
