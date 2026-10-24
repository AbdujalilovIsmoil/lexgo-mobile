import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
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
const SLIDE = { duration: 240, easing: Easing.out(Easing.cubic) };

// The sidebar kept open beside the page on a wide tablet (the phone's drawer is not drawn there, see ClientSidebar). Same rows as the drawer.
// It is always DOCK_W wide inside; the box around it is only narrower when closed, so the icons never move and the titles are simply cut off
// (and faded by `reveal`).
function Dock({ reveal }: { reveal: SharedValue<number> }) {
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
}

// The tab on the dock's edge: closes the sidebar (it shrinks to a rail of icons) and, when it is closed, opens it again.
function DockTab({ open, w }: { open: boolean; w: SharedValue<number> }) {
  const { t } = useT();
  const { height } = useTablet();
  const toggle = useDock((st) => st.toggle);
  const edge = useAnimatedStyle(() => ({ left: w.value }));
  return (
    <Animated.View style={[s.tabBox, { top: height * 0.38 }, edge]}>
      <PressableScale onPress={toggle} scale={0.94} accessibilityRole="button" accessibilityLabel={t(open ? "a11y.close" : "ntd.sbOpen")} style={s.tab}>
        <Icon name={open ? "chevron-left" : "chevron-right"} size={20} tone="white" />
      </PressableScale>
    </Animated.View>
  );
}

// Wraps the app's pages. On a phone (and on a small tablet) it is the page itself, untouched; on a wide tablet the sidebar sits to its left.
// The sidebar slides over the page (a transform-cheap change on the UI thread) and the page is laid out once, not on every frame: it takes its new
// width at the start when the sidebar closes, at the end when it opens.
export function TabletFrame({ children }: { children: ReactNode }) {
  const { docked } = useTablet();
  const hidden = useSidebarHidden();
  const open = useDock((st) => st.open);
  const w = useSharedValue(open ? DOCK_W : RAIL_W);
  const reveal = useDerivedValue(() => (w.value - RAIL_W) / (DOCK_W - RAIL_W));
  const [left, setLeft] = useState(open ? DOCK_W : RAIL_W);
  useEffect(() => {
    w.value = withTiming(open ? DOCK_W : RAIL_W, SLIDE);
    const id = setTimeout(() => setLeft(open ? DOCK_W : RAIL_W), open ? SLIDE.duration + 20 : 0);
    return () => clearTimeout(id);
  }, [open, w]);
  const box = useAnimatedStyle(() => ({ width: w.value }));
  if (!docked) return <>{children}</>;
  return (
    <View style={s.row}>
      <View style={[s.page, { marginLeft: hidden ? 0 : left }]}>{children}</View>
      {hidden ? null : (
        <>
          <Animated.View style={[s.wrap, box]}><Dock reveal={reveal} /></Animated.View>
          <DockTab open={open} w={w} />
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
  tabBox: { position: "absolute", zIndex: 5 },
  tab: { width: 26, height: 84, borderTopRightRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center", shadowColor: "#1668F0", shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
});
