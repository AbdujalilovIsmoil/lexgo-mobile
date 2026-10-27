import type { ComponentType } from "react";
import { create } from "zustand";

// App-wide overlays a package adds next to the toasts and the confirm dialog (the remote-assistance banner and consent): they are drawn
// in the same top-most host, so they stay above every sheet. The app layer adds them; shared UI imports no feature.
type Slot = { key: string; C: ComponentType };

export const useOverlaySlots = create<{ list: Slot[] }>(() => ({ list: [] }));

export function addOverlay(key: string, C: ComponentType): () => void {
  useOverlaySlots.setState((s) => ({ list: [...s.list.filter((x) => x.key !== key), { key, C }] }));
  return () => useOverlaySlots.setState((s) => ({ list: s.list.filter((x) => x.key !== key || x.C !== C) }));
}
