import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useAccess } from "@/entities/access";
import { useColors } from "@/shared/theme";
import { useHideHandle } from "../model/useCurrentModule";
import { AdminDrawer } from "./AdminDrawer";
import { DrawerHandle } from "./DrawerHandle";
import { DrawerPanel } from "./DrawerPanel";

const WIDE = 900;

// Wraps the admin stack. A sales operator gets none of it: the role's own sidebar (ClientSidebar) stays on these screens.
// On a phone: the edge handle + sliding switcher. On a tablet (wide window): the switcher is a permanent rail.
export function AdminDrawerHost({ children }: { children: ReactNode }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const hide = useHideHandle();
  const { salesOperator } = useAccess();
  if (salesOperator) return <View style={s.fill}>{children}</View>;
  if (width >= WIDE && !hide) {
    return (
      <View style={s.row}>
        <View style={[s.rail, { borderRightColor: c.line }]}><DrawerPanel /></View>
        <View style={s.fill}>{children}</View>
      </View>
    );
  }
  return (
    <View style={s.fill}>
      {children}
      {hide ? null : <DrawerHandle />}
      <AdminDrawer />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  row: { flex: 1, flexDirection: "row" },
  rail: { width: 300, borderRightWidth: 1 },
});
