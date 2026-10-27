import { create } from "zustand";

export type ToastKind = "info" | "ok" | "err";
type Toast = { id: number; text: string; kind: ToastKind };

type ToastState = {
  toasts: Toast[];
  show: (text: string, kind?: ToastKind, ms?: number) => void;
  dismiss: (id: number) => void;
};

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (text, kind = "info", ms = 3200) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), ms);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// `ms`: how long it stays (a long text, e.g. a list of allowed file types, needs more than the default).
export const toast = (text: string, kind?: ToastKind, ms?: number) => useToastStore.getState().show(text, kind, ms);
