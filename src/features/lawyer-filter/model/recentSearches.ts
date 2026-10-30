import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "lexgo_lawyer_recent_searches";
const MAX = 6;

// The directory's last searches (this device only), newest first, for the suggestions under an empty search field.
type State = { items: string[]; add: (q: string) => void; clear: () => void };
export const useRecentSearches = create<State>((set, get) => ({
  items: [],
  add: (q) => {
    const v = q.trim();
    if (v.length < 2) return;
    const items = [v, ...get().items.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, MAX);
    set({ items });
    void AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  },
  clear: () => {
    set({ items: [] });
    void AsyncStorage.removeItem(KEY).catch(() => {});
  },
}));
void AsyncStorage.getItem(KEY).then((v) => {
  const items = v ? (JSON.parse(v) as unknown) : [];
  if (Array.isArray(items)) useRecentSearches.setState({ items: items.filter((x): x is string => typeof x === "string").slice(0, MAX) });
}).catch(() => {});
