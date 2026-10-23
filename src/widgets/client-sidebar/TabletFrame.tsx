import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import { useTablet } from "@/shared/lib/useTablet";
import { useColors } from "@/shared/theme";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GUEST_OPEN } from "./navItems";
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

// Wraps the app's pages. On a phone (and on a small tablet) it is the page itself, untouched; on a wide tablet the sidebar sits to its left.
export function TabletFrame({ children }: { children: ReactNode }) {
  const { docked } = useTablet();
  const hidden = useSidebarHidden();
  if (!docked) return <>{children}</>;
  return (
    <View style={s.row}>
      {hidden ? null : <Dock />}
      <View style={s.page}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flex: 1, flexDirection: "row" },
  page: { flex: 1 },
  dock: { width: DOCK_W, borderRightWidth: StyleSheet.hairlineWidth },
});
