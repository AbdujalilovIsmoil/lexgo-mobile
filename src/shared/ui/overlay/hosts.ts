import { create } from "zustand";

// Where the app-wide overlays (confirm dialog, toasts) are drawn. A native Modal (bottom sheet, file preview, a
// transparent route …) covers everything drawn at the root, and on iOS a root Modal cannot be presented while another
// one is up. So every such surface registers a host while it is open, and only the top-most one draws the overlays;
// with none open the root draws them. 0 = the root.
type Hosts = { stack: number[]; add: (id: number) => void; remove: (id: number) => void };

export const useOverlayHosts = create<Hosts>((set) => ({
  stack: [],
  add: (id) => set((s) => ({ stack: [...s.stack.filter((x) => x !== id), id] })),
  remove: (id) => set((s) => ({ stack: s.stack.filter((x) => x !== id) })),
}));

export const ROOT_HOST = 0;

/** The host that draws the overlays now: the last surface opened that is still open, else the root. */
export const topHost = (stack: readonly number[]): number => (stack.length ? stack[stack.length - 1] : ROOT_HOST);

let seq = 0;
export const nextHostId = (): number => (seq += 1);
