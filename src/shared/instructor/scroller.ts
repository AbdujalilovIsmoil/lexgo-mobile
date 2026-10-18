import { useCallback, useEffect, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useIsFocused } from "expo-router";
import { measureNode } from "./measure";
import { findTarget } from "./registry";

type Scrollable = { scrollTo?: (o: { y: number; animated: boolean }) => void; scrollToOffset?: (o: { offset: number; animated: boolean }) => void };
type Scroller = { node: () => unknown; y: () => number; to: (y: number) => void };

const stack: Scroller[] = [];
const MARGIN = 96;

// The screen's main scroll view: `<ScrollView {...scroll}>` lets `scroll_to` bring a target into view.
export function useInstructorScroller() {
  const ref = useRef<Scrollable | null>(null);
  const offset = useRef(0);
  const front = useIsFocused();
  useEffect(() => {
    if (!front) return;
    const sc: Scroller = {
      node: () => ref.current,
      y: () => offset.current,
      to: (y) => (ref.current?.scrollTo ? ref.current.scrollTo({ y, animated: true }) : ref.current?.scrollToOffset?.({ offset: y, animated: true })),
    };
    stack.push(sc);
    return () => void stack.splice(stack.indexOf(sc), 1);
  }, [front]);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offset.current = e.nativeEvent.contentOffset.y;
  }, []);
  return { ref, onScroll, scrollEventThrottle: 32 } as const;
}

// Scroll the front screen until the target sits near the top. False when the target or a scroller is missing.
export async function scrollToTarget(id: string): Promise<boolean> {
  const t = findTarget(id);
  const sc = stack[stack.length - 1];
  const rect = t ? await t.measure() : null;
  if (!rect) return false;
  const box = sc ? await measureNode(sc.node()) : null;
  if (!sc || !box) return true;
  const inside = rect.y >= box.y && rect.y + rect.height <= box.y + box.height;
  if (!inside) sc.to(Math.max(0, sc.y() + rect.y - box.y - MARGIN));
  await new Promise((r) => setTimeout(r, inside ? 0 : 520));
  return true;
}
