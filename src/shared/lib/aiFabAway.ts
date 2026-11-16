import { create } from "zustand";

// The floating AI button (widgets/tab-bar/AiFab) slides off to the right while a page is scrolled down and comes back on a small scroll up.
// The page that scrolls (Home) sets it; leaving the page clears it, so the button is never left away on another tab.
export const useAiFabAway = create<{ away: boolean; set: (v: boolean) => void }>((set) => ({ away: false, set: (away) => set((s) => (s.away === away ? s : { away })) }));
