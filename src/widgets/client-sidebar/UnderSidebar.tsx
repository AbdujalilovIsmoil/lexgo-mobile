import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSidebar } from "./sidebarStore";

// The pages under the phone's drawer. While the drawer is out the dim layer already takes every touch; this hides the page from
// VoiceOver / TalkBack too, so the drawer's rows are the only things a screen reader can reach.
export function UnderSidebar({ children }: { children: ReactNode }) {
  const open = useSidebar((s) => s.open);
  return (
    <View style={s.fill} accessibilityElementsHidden={open} importantForAccessibility={open ? "no-hide-descendants" : "auto"}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 } });
