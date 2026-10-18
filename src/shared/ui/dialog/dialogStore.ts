import { create } from "zustand";
import type { IconName } from "../Icon";

export type DialogSpec = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: IconName;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

type DialogState = { spec: DialogSpec | null; open: (spec: DialogSpec) => void; close: () => void };

export const useDialogStore = create<DialogState>((set) => ({
  spec: null,
  open: (spec) => set({ spec }),
  close: () => set({ spec: null }),
}));

// Imperative, like toast(): confirmDialog({ ... }) from any hook or handler.
export const confirmDialog = (spec: DialogSpec) => useDialogStore.getState().open(spec);
