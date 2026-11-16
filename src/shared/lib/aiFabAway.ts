import { useCallback, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAnimatedReaction, useSharedValue, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { create } from "zustand";

// The floating AI button (widgets/tab-bar/AiFab) slides off to the right while a page is scrolled down and comes back on a small scroll up.
// The page that scrolls sets it; leaving the page clears it, so the button is never left away on another tab.
export const useAiFabAway = create<{ away: boolean; set: (v: boolean) => void }>((set) => ({ away: false, set: (away) => set((s) => (s.away === away ? s : { away })) }));

// A page may give the floating AI button its own job while it is in view (the directory: "Muammoingizni yozing" — the AI search). The
// button keeps its look; `label` is what a screen reader says. The page sets it on focus and clears it when it leaves.
// With a `label` the button grows into a pill that shows it (and `sub` under it) beside the sparkle.
export const useAiFabAction = create<{ action: (() => void) | null; label: string; sub: string; set: (action: (() => void) | null, label?: string, sub?: string) => void }>((set) => ({
  action: null,
  label: "",
  sub: "",
  set: (action, label = "", sub = "") => set({ action, label, sub }),
}));

export const AI_FAB_TOP_ZONE = 40; // near the top the button always shows
export const AI_FAB_HIDE_AFTER = 12; // points scrolled down before it leaves
export const AI_FAB_SHOW_AFTER = 18; // points scrolled up before it comes back

export type AiFabScrollState = { y: number; mark: number; away: boolean };

// One scroll step: whether the button is away at `y`. `mark` is where the current run started — it follows the run that keeps the state,
// so the button leaves after 12 pt down and comes back after 18 pt up from the turning point. Mutates `st`.
export function aiFabStep(st: AiFabScrollState, y: number): boolean {
  let next = st.away;
  if (y <= AI_FAB_TOP_ZONE) next = false;
  else if (y - st.mark > AI_FAB_HIDE_AFTER) next = true;
  else if (st.mark - y > AI_FAB_SHOW_AFTER) next = false;
  if ((st.away ? y > st.mark : y < st.mark) || next !== st.away) st.mark = y;
  st.y = y;
  st.away = next;
  return next;
}

// The same behaviour for a tab page's plain ScrollView / FlatList (Home runs it as a worklet): pass the returned handler as `onScroll`
// (with scrollEventThrottle 16). Leaving the page brings the button back.
export function useAiFabScroll() {
  const setAway = useAiFabAway((x) => x.set);
  const st = useRef<AiFabScrollState>({ y: 0, mark: 0, away: false });
  useFocusEffect(useCallback(() => {
    st.current.away = false;
    st.current.mark = st.current.y;
    return () => setAway(false);
  }, [setAway]));
  return useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const was = st.current.away;
    const next = aiFabStep(st.current, e.nativeEvent.contentOffset.y);
    if (next !== was) setAway(next);
  }, [setAway]);
}

// The same for a page whose scroll position is already a shared value (a Reanimated scroll handler): follows `scrollY` on the UI thread and
// tells the button only when its state changes. `on` false: the page does not drive the button (a stack page without the tab bar).
export function useAiFabFollow(scrollY: SharedValue<number>, on = true) {
  const setAway = useAiFabAway((x) => x.set);
  const mark = useSharedValue(0);
  const away = useSharedValue(false);
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      if (!on) return;
      let next = away.value;
      if (y <= AI_FAB_TOP_ZONE) next = false;
      else if (y - mark.value > AI_FAB_HIDE_AFTER) next = true;
      else if (mark.value - y > AI_FAB_SHOW_AFTER) next = false;
      if ((away.value ? y > mark.value : y < mark.value) || next !== away.value) mark.value = y;
      if (next !== away.value) {
        away.value = next;
        scheduleOnRN(setAway, next);
      }
    },
    [on, setAway],
  );
  useFocusEffect(useCallback(() => {
    away.set(false);
    mark.set(scrollY.get());
    return () => setAway(false);
  }, [setAway, away, mark, scrollY]));
}
