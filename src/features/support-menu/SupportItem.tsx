import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";

type Props = { icon: IconName; kind: "case" | "call"; title: string; sub: string; subBold?: boolean; onPress: () => void; children?: ReactNode };

// A Home-style card: white with a hairline and a soft shadow; the icon on a soft square (amber for the complaint, green for the call), the
// text and extras (working hours) in the middle and a small round action on the right.
export function SupportItem({ icon, kind, title, sub, subBold, onPress, children }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const fg = kind === "case" ? c.warn : c.ok;
  const bg = kind === "case" ? c.warnBg : c.okBg;
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="menuitem" accessibilityLabel={title} style={[s.card, { backgroundColor: dark || glass ? c.surface2 : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !(dark || glass) && s.shadow]}>
      <View style={[s.tile, { backgroundColor: bg }]}><Icon name={icon} size={19} color={fg} /></View>
      <View style={s.tx}>
        <Text variant="h4" numberOfLines={1} style={s.title}>{title}</Text>
        <Text variant={subBold ? "body" : "caption"} weight={subBold ? "bold" : "regular"} tone={subBold ? "ink" : "gray"} numberOfLines={subBold ? 1 : 2} adjustsFontSizeToFit={subBold} style={subBold ? s.phone : s.sub}>{sub}</Text>
        {children}
      </View>
      <View style={[s.go, { backgroundColor: bg }]}><Icon name={kind === "call" ? "phone" : "arrow-right"} size={15} color={fg} /></View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1 },
  tile: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tx: { flex: 1, gap: 2 },
  title: { fontSize: 14, lineHeight: 18 },
  sub: { fontSize: 12, lineHeight: 16 },
  phone: { fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
  go: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 1 } })!,
});
