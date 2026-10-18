import { create } from "zustand";

// The "Demo" switch at the top of every page header: while it is on, the screens that have demo data show it instead of the
// answer of the server (even when the server has data). Off by default and not saved: a restart is a real app again.
type State = { on: boolean; set: (v: boolean) => void };
export const useDemo = create<State>((set) => ({ on: false, set: (on) => set({ on }) }));
export const demoOn = (): boolean => useDemo.getState().on;
