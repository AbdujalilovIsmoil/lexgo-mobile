import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { readJson, writeJson } from "@/shared/lib/storage";

const KEY = "admin.recent.modules";
const MAX = 6;
type State = { keys: string[]; loaded: boolean; load: () => Promise<void>; add: (k: string) => void; clear: () => void };

// The admin sections this person opened last (device only, dropped on logout) — the hub's "recently opened" rail.
export const useRecentModules = create<State>((set, get) => ({
  keys: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const saved = await readJson<string[]>(KEY);
    if (!get().loaded) set({ keys: Array.isArray(saved) ? saved.filter((k) => typeof k === "string").slice(0, MAX) : [], loaded: true });
  },
  add: (k) => {
    const keys = [k, ...get().keys.filter((x) => x !== k)].slice(0, MAX);
    set({ keys });
    void writeJson(KEY, keys);
  },
  clear: () => {
    set({ keys: [], loaded: false });
    void writeJson(KEY, null);
  },
}));

registerSessionReset(() => useRecentModules.getState().clear());
