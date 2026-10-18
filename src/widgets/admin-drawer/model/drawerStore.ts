import { create } from "zustand";

type DrawerState = { open: boolean; setOpen: (v: boolean) => void };

// Open / closed state of the module switcher (opened from the edge handle, closed on navigation).
export const useDrawer = create<DrawerState>((set) => ({ open: false, setOpen: (open) => set({ open }) }));
