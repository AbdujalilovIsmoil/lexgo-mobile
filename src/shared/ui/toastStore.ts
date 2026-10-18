import { create } from "zustand";

export type ToastKind = "info" | "ok" | "err";
type Toast = { id: number; text: string; kind: ToastKind };

type ToastState = {
  toasts: Toast[];
  show: (text: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
};

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (text, kind = "info") => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (text: string, kind?: ToastKind) => useToastStore.getState().show(text, kind);
