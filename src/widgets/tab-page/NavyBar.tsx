import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { FocusStatusBar, GradientBox, PressableScale, Text } from "@/shared/ui";
// import { MenuButton } from "@/widgets/client-sidebar/MenuButton"; // the drawer is off: its rows are on the profile page now
import { HeaderActions } from "./HeaderActions";

type Props = {
  title?: string;
  sub?: string; // a small light line under the title (Adliya: "Advokat · Pro tarif")
  onTitlePress?: () => void;
  children?: ReactNode; // under the row, inside the band (Adliya: the quick chips)
  avatar?: ReactNode; // at the left end, before the title (the home: the professional's photo)
};

// A professional's tab header in the Adliya look: the navy band with rounded bottom corners and a faint ring in the corner — an optional avatar, an
// optional title (Ish maydoni, or the professional's name with a line under it) and the same round tools (support, bell, avatar) as every
// other header — so the page below starts straight with its content.
export function NavyBar({ title, sub, onTitlePress, children, avatar }: Props) {
  const insets = useInsets();
  const head = title ? (
    <View style={s.who}>
      <Text variant={sub ? "h4" : "h3"} tone="white" numberOfLines={1} style={sub ? s.name : s.title}>{title}</Text>
      {sub ? <Text variant="caption" numberOfLines={1} style={s.sub}>{sub}</Text> : null}
    </View>
  ) : null;
  return (
    <GradientBox variant="dark" round={0} style={[s.band, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View pointerEvents="none" style={s.ring} />
      <View style={s.bar}>
        <View style={s.left}>
          {/* <MenuButton glass /> */}
          {avatar}
          {head && onTitlePress ? (
            <PressableScale onPress={onTitlePress} scale={0.98} accessibilityRole="button" accessibilityLabel={sub ? `${title}, ${sub}` : title} style={s.press}>{head}</PressableScale>
          ) : head}
        </View>
        <HeaderActions glass />
      </View>
      {children}
    </GradientBox>
  );
}

const s = StyleSheet.create({
  band: { paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  ring: { position: "absolute", right: -50, top: -30, width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 16 },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  press: { flex: 1, minWidth: 0 },
  who: { flexShrink: 1, minWidth: 0 },
  title: { flexShrink: 1 },
  name: { fontSize: 15.5, lineHeight: 20 },
  sub: { color: "#AFC0E0", fontSize: 11.5, lineHeight: 15 },
});
