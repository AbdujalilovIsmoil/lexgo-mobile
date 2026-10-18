import { create } from "zustand";

// How many bottom sheets / modals are open right now. Anything heavy that runs behind them (the 3D robot's render loop)
// pauses while this is above zero: it cannot be seen and would only steal frames from the sheet.
export const useSheetsOpen = create<{ n: number; enter: () => void; leave: () => void }>((set) => ({
  n: 0,
  enter: () => set((s) => ({ n: s.n + 1 })),
  leave: () => set((s) => ({ n: Math.max(0, s.n - 1) })),
}));
