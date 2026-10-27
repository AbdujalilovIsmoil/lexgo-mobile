import { useCallback, useEffect, useRef } from "react";
import type { LayoutChangeEvent, View } from "react-native";
import { useIsFocused } from "expo-router";
import { measureView } from "./measure";
import type { RaRect } from "./types";

type Scrollable = { scrollTo?: (o: { y: number; animated?: boolean }) => void } | null;
type Scroller = { to: (target: RaRect) => Promise<boolean> };

const stack: Scroller[] = [];
const TOP = 170; // the control lands below the page header and the assistance banner
const settle = () => new Promise((r) => setTimeout(r, 420));

// The front screen's main scroll view, so page.scroll_to can bring a control into view:
//   const { view, anchor } = useRaScroller();  →  <ScrollView {...view}><View {...anchor} />…</ScrollView>
// The anchor's distance to the control is the scroll needed, whatever the offset is now.
export function useRaScroller() {
  const view = useRef<Scrollable>(null);
  const anchor = useRef<View>(null);
  const top = useRef(0);
  const front = useIsFocused();
  useEffect(() => {
    if (!front) return;
    const sc: Scroller = {
      to: async (target) => {
        const [a, box] = await Promise.all([measureView(anchor.current), measureView(view.current)]);
        if (!a || !view.current?.scrollTo) return false;
        // the control's y inside the content, then the offset that puts it TOP below the window's top edge
        const y = top.current + target.y - a.y;
        view.current.scrollTo({ y: Math.max(0, (box?.y ?? 0) + y - TOP), animated: true });
        await settle();
        return true;
      },
    };
    stack.push(sc);
    return () => void stack.splice(stack.indexOf(sc), 1);
  }, [front]);
  // A callback ref takes any scroll view (ScrollView, KeyboardAwareScrollView …) without tying the type to one of them.
  const ref = useCallback((node: unknown) => {
    view.current = node as Scrollable;
  }, []);
  const onLayout = (e: LayoutChangeEvent) => {
    top.current = e.nativeEvent.layout.y;
  };
  return { view: { ref }, anchor: { ref: anchor, onLayout, collapsable: false, pointerEvents: "none" as const, style: ANCHOR } };
}

// Out of the layout flow (no gap is added to the content), 1 pt so it can be measured.
const ANCHOR = { position: "absolute", top: 0, left: 0, width: 1, height: 1 } as const;

/** Scrolls the front screen so the rectangle is in view; false when the screen has no registered scroll view. */
export async function scrollIntoView(target: RaRect): Promise<boolean> {
  const sc = stack[stack.length - 1];
  return sc ? sc.to(target) : false;
}
