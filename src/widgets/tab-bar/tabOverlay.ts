import type { ComponentType } from "react";
import { create } from "zustand";

// iOS: a tab page the system bar does not show (the directory, orders) opens OVER the open tab's content, inside the
// system tab bar — so the real Liquid Glass bar stays under it, exactly as on Home. A press on any tab, or a link to a tab the bar
// shows, closes it. Pages are registered by the tabs layout (the app layer); a link with a query still opens the stack copy (/m/…).
type State = { name: string | null; open: (name: string) => void; close: () => void };
export const useTabOverlay = create<State>((set) => ({ name: null, open: (name) => set({ name }), close: () => set({ name: null }) }));

const pages = new Map<string, ComponentType>();
export const registerOverlayPage = (name: string, page: ComponentType) => { pages.set(name, page); };
export const overlayPage = (name: string | null): ComponentType | undefined => (name ? pages.get(name) : undefined);
export const canOverlay = (name: string): boolean => pages.has(name);
