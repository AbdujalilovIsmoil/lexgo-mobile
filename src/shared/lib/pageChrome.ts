import { useSyncExternalStore } from "react";
import { useNavigation } from "expo-router";
import { makeMutable, type SharedValue } from "react-native-reanimated";

// What a stack screen's header and its scroll view share: the header says how tall it is, the scroll view says how far it has scrolled.
// With both known, the scroll view runs up under the header (which turns to blur glass as the page moves). One record per screen.
export type PageChrome = { y: SharedValue<number>; h: number; subs: Set<() => void> };

const chromes = new WeakMap<object, PageChrome>();

export function usePageChrome(): PageChrome {
  const nav = useNavigation() as object;
  let c = chromes.get(nav);
  if (!c) { c = { y: makeMutable(0), h: 0, subs: new Set() }; chromes.set(nav, c); }
  return c;
}

export function setHeaderHeight(c: PageChrome, h: number) {
  const next = Math.round(h);
  if (c.h === next) return;
  c.h = next;
  c.subs.forEach((f) => f());
}

export function useHeaderHeight(c: PageChrome): number {
  return useSyncExternalStore(
    (f) => { c.subs.add(f); return () => { c.subs.delete(f); }; },
    () => c.h,
  );
}
