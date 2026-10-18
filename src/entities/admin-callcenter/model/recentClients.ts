import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { readJson, writeJson } from "@/shared/lib/storage";
import type { CcClient } from "./types";

const KEY = "cc.recent.clients";
const MAX = 12;
type State = { items: CcClient[]; loaded: boolean; load: () => Promise<void>; add: (c: CcClient) => Promise<void>; clear: () => void };

// Clients the operator opened lately (Mijozlar tab). Kept on the device only, dropped on logout / user change (TZ 45.9).
export const useRecentClients = create<State>((set, get) => ({
  items: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const saved = await readJson<CcClient[]>(KEY);
    if (!get().loaded) set({ items: Array.isArray(saved) ? saved.filter((c) => c && c.id) : [], loaded: true });
  },
  add: async (c) => {
    await get().load();
    const items = [c, ...get().items.filter((x) => x.id !== c.id)].slice(0, MAX);
    set({ items });
    void writeJson(KEY, items);
  },
  clear: () => {
    set({ items: [], loaded: false });
    void writeJson(KEY, null);
  },
}));

registerSessionReset(() => useRecentClients.getState().clear());
