import { Keyboard } from "react-native";
import { create } from "zustand";

type S = {
  open: boolean;
  drive: ((open: boolean) => void) | null;
  register: (fn: ((open: boolean) => void) | null) => void;
  show: () => void;
  hide: () => void;
  mirror: (open: boolean) => void;
};

// `open` only mirrors where the drawer actually is (written by useDrawer from its position). show / hide never touch
// it: they ask the drawer to move, and the position then updates `open`. One direction only, so the two can never
// fight each other. Opening drops the keyboard: typing must not go on into a field of the page behind the drawer.
export const useSidebar = create<S>((set, get) => ({
  open: false,
  drive: null,
  register: (drive) => set({ drive }),
  show: () => {
    Keyboard.dismiss();
    get().drive?.(true);
  },
  hide: () => get().drive?.(false),
  mirror: (open) => set({ open }),
}));
