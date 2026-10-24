import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
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

// The sidebar kept open beside the page on a wide tablet (the phone's drawer is not drawn there, see ClientSidebar). Same rows as the drawer.
function Dock() {
  const c = useColors();
  const router = useRouter();
  const role = useTabRole();
  const p = useSharedValue(1); // the rows' arrival cascade belongs to the drawer: here they are simply there
  const go = (route: string) => router.navigate((role === "guest" && !GUEST_OPEN.includes(route.split("?")[0]) ? "/auth/login" : route) as never);
  return (
    <View style={[s.dock, { backgroundColor: c.surface, borderColor: c.line }]}>
      <SidebarPanel p={p} onGo={go} />
    </View>
  );
}

// The tab on the dock's edge: closes the sidebar (a page then uses the whole width) and, when it is closed, opens it again.
function DockTab({ open }: { open: boolean }) {
  const { t } = useT();
  const { height } = useTablet();
  const toggle = useDock((st) => st.toggle);
  return (
    <PressableScale onPress={toggle} scale={0.94} accessibilityRole="button" accessibilityLabel={t(open ? "a11y.close" : "ntd.sbOpen")} style={[s.tab, { top: height * 0.38 }]}>
      <Icon name={open ? "chevron-left" : "chevron-right"} size={20} tone="white" />
    </PressableScale>
  );
}

// Wraps the app's pages. On a phone (and on a small tablet) it is the page itself, untouched; on a wide tablet the sidebar sits to its left.
export function TabletFrame({ children }: { children: ReactNode }) {
  const { docked } = useTablet();
  const hidden = useSidebarHidden();
  const open = useDock((st) => st.open);
  const w = useSharedValue(open ? DOCK_W : 0);
  useEffect(() => {
    w.value = withTiming(open ? DOCK_W : 0, { duration: 220 });
  }, [open, w]);
  const dock = useAnimatedStyle(() => ({ width: w.value }));
  if (!docked) return <>{children}</>;
  return (
    <View style={s.row}>
      {hidden ? null : <Animated.View style={[s.wrap, dock]}><Dock /></Animated.View>}
      <View style={s.page}>
        {children}
        {hidden ? null : <DockTab open={open} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flex: 1, flexDirection: "row" },
  page: { flex: 1 },
  wrap: { overflow: "hidden" },
  dock: { width: DOCK_W, flex: 1, borderRightWidth: StyleSheet.hairlineWidth },
  tab: { position: "absolute", left: 0, width: 26, height: 84, borderTopRightRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center", zIndex: 5, shadowColor: "#1668F0", shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
});
