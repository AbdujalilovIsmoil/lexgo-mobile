import { StyleSheet, View } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { FocusStatusBar, GradientBox, Text } from "@/shared/ui";
import { MenuButton } from "@/widgets/client-sidebar/MenuButton";
import { HeaderActions } from "./HeaderActions";

// A professional's tab header: a compact navy bar — the menu, an optional title (Ish maydoni) and the same round tools (support, bell,
// avatar) as every other header — so the page below starts straight with its content.
export function NavyBar({ title }: { title?: string }) {
  const insets = useInsets();
  return (
    <GradientBox variant="dark" round={0} style={[s.bar, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View style={s.left}>
        <MenuButton glass />
        {title ? <Text variant="h3" tone="white" numberOfLines={1} style={s.title}>{title}</Text> : null}
      </View>
      <HeaderActions glass />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  title: { flexShrink: 1 },
});
