import { StyleSheet, useWindowDimensions } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { BottomSheet, SheetScroll } from "../sheet";
import { Icon, type IconName } from "../Icon";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

export type ActionItem = { key: string; label: string; icon?: IconName; danger?: boolean; onPress: () => void };

// A menu of actions in a drawer ("more" on a record). Picking one closes the drawer first.
export function ActionList({ visible, onClose, title, actions }: { visible: boolean; onClose: () => void; title?: string; actions: ActionItem[] }) {
  const c = useColors();
  const insets = useInsets();
  const { height } = useWindowDimensions();
  // As tall as its rows (title, gap, n rows of 52 + 16 between, safe area) — never cut off, never an empty half-screen.
  const fit = Math.min(0.92, ((title ? 92 : 56) + 14 + actions.length * 68 + insets.bottom + 24) / height);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} snaps={[fit]}>
      <SheetScroll>
        {actions.map((a) => (
          <PressableScale key={a.key} onPress={() => { onClose(); setTimeout(a.onPress, 320); }} style={[s.row, { backgroundColor: c.surface2 }]}>
            {a.icon ? <Icon name={a.icon} size={19} color={a.danger ? c.err : c.accent} /> : null}
            <Text variant="body" weight="semibold" style={a.danger ? { color: c.err } : undefined}>{a.label}</Text>
          </PressableScale>
        ))}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderRadius: 14 } });
