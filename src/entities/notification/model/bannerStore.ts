import { create } from "zustand";
import type { Notification } from "./types";

// The notification currently shown as an in-app banner (widgets/notification-banner renders it).
type BannerState = { item: Notification | null; show: (n: Notification) => void; hide: () => void };

export const useBannerStore = create<BannerState>((set) => ({
  item: null,
  show: (item) => set({ item }),
  hide: () => set({ item: null }),
}));

export const showBanner = (n: Notification): void => useBannerStore.getState().show(n);
