import { memo, useLayoutEffect, useRef, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";
import { useT } from "@/shared/i18n";
import { useTablet } from "@/shared/lib/useTablet";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale } from "@/shared/ui";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GUEST_OPEN } from "./navItems";
import { useDock } from "./dockStore";
import { SidebarPanel } from "./SidebarPanel";
import { useSidebarHidden } from "./useSidebarHidden";

const DOCK_W = 288;
const RAIL_W = 76; // closed: the icons only
const GROW = DOCK_W - RAIL_W; // how much wider the open sidebar is: how far the page travels
const SLIDE = { duration: 240, easing: Easing.out(Easing.cubic) };

// The sidebar kept open beside the page on a wide tablet (the phone's drawer is not drawn there, see ClientSidebar). Same rows as the drawer.
// It is always DOCK_W wide inside; the box around it is only narrower when closed, so the icons never move and the titles are simply cut off
// (and faded by `reveal`). Memoised: opening or closing it does not draw its rows again (on the slide's first frames that work showed).
const Dock = memo(function Dock({ reveal }: { reveal: SharedValue<number> }) {
  const c = useColors();
  const router = useRouter();
  const role = useTabRole();
  const p = useSharedValue(1); // the rows' arrival cascade belongs to the drawer: here they are simply there
  const go = (route: string) => router.navigate((role === "guest" && !GUEST_OPEN.includes(route.split("?")[0]) ? "/auth/login" : route) as never);
  return (
    <View style={[s.dock, { backgroundColor: c.surface }]}>
      <SidebarPanel p={p} onGo={go} reveal={reveal} />
    </View>
  );
});

// The tab on the dock's edge: closes the sidebar (it shrinks to a rail of icons) and, when it is closed, opens it again. Its chevron turns
// with the slide (left while open, right while closed), so a tap draws nothing on the JS side.
function DockTab({ open, w, reveal, onToggle }: { open: boolean; w: SharedValue<number>; reveal: SharedValue<number>; onToggle: () => void }) {
  const { t } = useT();
  const { height } = useTablet();
  const edge = useAnimatedStyle(() => ({ transform: [{ translateX: w.value }] })); // a translation: the tab is never laid out again as it slides
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${(1 - reveal.value) * 180}deg` }] }));
  return (
    <Animated.View style={[s.tabBox, { top: height * 0.38 }, edge]}>
      <PressableScale onPress={onToggle} scale={0.94} accessibilityRole="button" accessibilityLabel={t(open ? "a11y.close" : "ntd.sbOpen")} style={s.tab}>
        <Animated.View style={chevron}><Icon name="chevron-left" size={20} tone="white" /></Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

// Wraps the app's pages. On a phone it is the page itself, untouched. On a tablet the page always sits in the same views (turning the tablet
// only changes a margin, so the app is not mounted again), and on a wide one the sidebar is docked to its left.
// Opening or closing, the page travels with the sidebar's edge by a translation, so nothing is laid out on the slide's frames, and its width
// changes once, on the right, where the extra part is past the screen's edge: closing, it is laid out wider first and slides left after it;
// opening, it slides right as it is and is laid out narrower once there. Its left edge never jumps, and the grids' tiles glide to their new
// columns (useGrid's `move`). All of it runs on the UI thread, which draws a new layout at once, before the next frame: drawing a whole page
// again takes a moment (~100 ms on a debug build in the simulator), so the closing slide waits two frames for it instead of freezing on its
// first frames, and a tap renders nothing in React (a React commit in flight would hold that layout back until after the slide had begun);
// the store follows when the slide is over. Without the sidebar (a chat, a call, a narrow tablet) the outer view's margin cancels the
// translation, so a route that hides or shows the sidebar changes the page in the same frame as the sidebar.
export function TabletFrame({ children }: { children: ReactNode }) {
  const { tablet, docked } = useTablet();
  const hidden = useSidebarHidden();
  const open = useDock((st) => st.open);
  const full = hidden || !docked;
  const w = useSharedValue(open ? DOCK_W : RAIL_W); // the sidebar's width
  const x = useSharedValue(open ? GROW : 0); // the page's translation past the rail
  const r = useSharedValue(open ? GROW : 0); // the page's right margin: 0 is the wider layout (the sidebar closed)
  const turn = useSharedValue(0); // which tap a waiting slide belongs to (a newer one cancels it)
  const reveal = useDerivedValue(() => (w.value - RAIL_W) / GROW);
  const want = useRef(open); // where the sidebar is going; the store catches up when the slide is over
  const taps = useRef(0);
  // The slide's end: the remembered state follows (and the tab's label), unless another tap came since.
  const settle = (to: boolean, tap: number) => {
    if (tap === taps.current) useDock.getState().set(to);
  };
  // The remembered state read at start-up (or set anywhere else) takes its place at once, without a slide.
  useLayoutEffect(() => {
    if (want.current === open) return;
    want.current = open;
    w.set(open ? DOCK_W : RAIL_W);
    x.set(open ? GROW : 0);
    r.set(open ? GROW : 0);
  }, [open, w, x, r]);
  const slide = (opening: boolean, tap: number) => {
    "worklet";
    const mine = turn.get() + 1;
    turn.set(mine);
    const go = () => {
      if (turn.get() !== mine) return;
      w.set(withTiming(opening ? DOCK_W : RAIL_W, SLIDE));
      x.set(withTiming(opening ? GROW : 0, SLIDE, (done) => {
        if (!done) return;
        if (opening) r.set(GROW); // there: laid out narrower
        scheduleOnRN(settle, opening, tap);
      }));
    };
    if (opening || r.get() === 0) return go();
    r.set(0); // laid out wider first; the slide starts once that layout is drawn
    requestAnimationFrame(() => requestAnimationFrame(go));
  };
  const onToggle = () => {
    want.current = !want.current;
    taps.current += 1;
    scheduleOnUI(slide, want.current, taps.current);
  };
  const width = useAnimatedStyle(() => ({ marginRight: r.value }));
  const travel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const box = useAnimatedStyle(() => ({ width: w.value }));
  if (!tablet) return <>{children}</>;
  const rest = open ? GROW : 0; // where the translation settles
  return (
    <View style={s.row}>
      <View style={[s.page, { marginLeft: full ? -rest : RAIL_W }]}>
        <Animated.View style={[s.page, width, travel]}>{children}</Animated.View>
      </View>
      {full ? null : (
        <>
          <Animated.View style={[s.wrap, box]}><Dock reveal={reveal} /></Animated.View>
          <DockTab open={open} w={w} reveal={reveal} onToggle={onToggle} />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flex: 1 },
  page: { flex: 1 },
  wrap: { position: "absolute", top: 0, bottom: 0, left: 0, overflow: "hidden", zIndex: 4, borderRightWidth: StyleSheet.hairlineWidth, borderColor: "rgba(120,130,150,0.25)" },
  dock: { width: DOCK_W, flex: 1 },
  tabBox: { position: "absolute", left: 0, zIndex: 5 },
  tab: { width: 26, height: 84, borderTopRightRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center", shadowColor: "#1668F0", shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
});
