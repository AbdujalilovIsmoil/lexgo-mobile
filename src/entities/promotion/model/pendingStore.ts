import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { PENDING_TTL } from "../lib/signal";
import type { PendingPromo } from "./types";

type State = {
  items: Record<string, PendingPromo>; // "<userId>|<target>" → request waiting for the Telegram approval
  put: (uid: string, p: PendingPromo) => void;
  drop: (uid: string, test: (p: PendingPromo) => boolean) => PendingPromo[];
  wipe: () => void;
};

const fresh = (p: PendingPromo) => Date.now() - p.at <= PENDING_TTL;

// Checkouts the admin has not answered yet survive an app restart; the server events clear them.
export const usePendingStore = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      put: (uid, p) => set((s) => ({ items: { ...s.items, [`${uid}|${p.target}`]: p } })),
      drop: (uid, test) => {
        const gone: PendingPromo[] = [];
        const keep: Record<string, PendingPromo> = {};
        for (const [k, p] of Object.entries(get().items)) {
          if (k.startsWith(`${uid}|`) && (test(p) || !fresh(p))) gone.push(p);
          else keep[k] = p;
        }
        if (gone.length) set({ items: keep });
        return gone;
      },
      wipe: () => set({ items: {} }),
    }),
    { name: "lexgo_promo_pending", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

registerSessionReset(() => usePendingStore.getState().wipe());

export const pendingOf = (items: Record<string, PendingPromo>, uid: string): PendingPromo[] =>
  Object.entries(items).filter(([k, p]) => k.startsWith(`${uid}|`) && fresh(p)).map(([, p]) => p);
