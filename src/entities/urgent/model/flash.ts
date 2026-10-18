import { create } from "zustand";

export type UrgentNote = { ok: boolean; msg: string; next?: string };
type Flash = { note: UrgentNote | null; fresh: string; show: (note: UrgentNote | null, fresh?: string) => void; clear: () => void };

// What the order screen leaves for /urgent: the "request sent" banner and the id of the request it just made
// (highlighted in the list below), as on the web page that stays put after ordering.
export const useUrgentFlash = create<Flash>((set) => ({
  note: null,
  fresh: "",
  show: (note, fresh = "") => set({ note, fresh }),
  clear: () => set({ note: null, fresh: "" }),
}));
