import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { BottomSheet, SheetScroll } from "../sheet";
import { Icon, type IconName } from "../Icon";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

// `sub`: one line under the label (what the action does).
export type ActionItem = { key: string; label: string; sub?: string; icon?: IconName; danger?: boolean; onPress: () => void };

// A menu of actions in a drawer ("more" on a record; "new" on a list). Adliya look: every action is a white card — the icon on a soft blue tile,
// the label in bold with its line under it, a chevron. Picking one closes the drawer first.
export function ActionList({ visible, onClose, title, lead, actions }: { visible: boolean; onClose: () => void; title?: string; lead?: string; actions: ActionItem[] }) {
  const { colors: c, dark, glass } = useTheme();
  const insets = useInsets();
  const { height } = useWindowDimensions();
  // As tall as its rows (title, lead, n cards, safe area) — never cut off, never an empty half-screen.
  const rowsH = actions.reduce((a, x) => a + (x.sub ? 96 : 76), 0);
  const fit = Math.min(0.92, ((title ? 92 : 56) + (lead ? 56 : 0) + 14 + rowsH + insets.bottom + 24) / height);
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E2E8F1" };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} snaps={[fit]}>
      <SheetScroll>
        {lead ? <Text variant="body" tone="gray" style={s.lead}>{lead}</Text> : null}
        {actions.map((a) => (
          <PressableScale key={a.key} onPress={() => { onClose(); setTimeout(a.onPress, 320); }} scale={0.98} accessibilityRole="button" accessibilityLabel={a.label} style={[s.row, card, !glass && s.shadow]}>
            {a.icon ? (
              <View style={[s.tile, { backgroundColor: a.danger ? c.errBg : c.tint2 }]}><Icon name={a.icon} size={20} color={a.danger ? c.err : c.accent} /></View>
            ) : null}
            <View style={s.col}>
              <Text variant="body" weight="bold" style={[s.label, a.danger ? { color: c.err } : undefined]}>{a.label}</Text>
              {a.sub ? <Text variant="small" tone="gray" style={s.sub}>{a.sub}</Text> : null}
            </View>
            <Icon name="chevron-right" size={18} color={a.danger ? c.err : c.ink} />
          </PressableScale>
        ))}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  lead: { fontSize: 15, lineHeight: 21, marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 18, borderWidth: 1 },
  tile: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, minWidth: 0, gap: 2 },
  label: { fontSize: 16, lineHeight: 21 },
  sub: { fontSize: 13.5, lineHeight: 18 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, default: { elevation: 1 } })!,
});
