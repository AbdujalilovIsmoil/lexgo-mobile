import { create } from "zustand";
import { registerSessionReset } from "./sessionReset";

// Counters shown on tab icons, keyed by TabDef.badge ("messages", "requests",
// "support", "notifications"). The slice that knows the number sets it
// (setBadge from a query hook); the bar only reads.
type BadgeState = { badges: Record<string, number>; set: (key: string, n: number) => void };

export const useBadgeStore = create<BadgeState>((set) => ({
  badges: {},
  set: (key, n) => set((s) => (s.badges[key] === n ? s : { badges: { ...s.badges, [key]: n } })),
}));

export const setBadge = (key: string, n: number) => useBadgeStore.getState().set(key, n);
export const useBadge = (key?: string): number => useBadgeStore((s) => (key ? (s.badges[key] ?? 0) : 0));
registerSessionReset(() => useBadgeStore.setState({ badges: {} }));
