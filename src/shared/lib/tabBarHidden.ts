import { create } from "zustand";

// A tab page that is a full page in itself (the Hujjatlar catalogue) asks for no tab bar while it is open: Android's FlatBar and iOS's
// system bar (NativeTabsBar) both read this, and useTabClearance stops reserving room for the bar. Whoever sets it clears it again.
export const useTabBarHidden = create<{ hidden: boolean; set: (v: boolean) => void }>((set) => ({ hidden: false, set: (hidden) => set({ hidden }) }));
