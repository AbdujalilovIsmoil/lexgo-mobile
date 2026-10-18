import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { BottomSheet, Icon, PressableScale, SheetScroll, Text } from "@/shared/ui";
import type { Action } from "../useRequestActions";

type Props = { actions: Action[]; visible: boolean; onClose: () => void };

// The secondary actions of a record as big tappable rows; the sheet closes first, then the chosen action opens its own panel.
export function MoreSheet({ actions, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ugx.moreTitle")} snaps={[Math.min(0.9, 0.3 + actions.length * 0.09), 0.92]}>
      <SheetScroll contentContainerStyle={s.body}>
        {actions.map((a) => {
          const tone = a.soft ? c.err : c.accent;
          return (
            <PressableScale key={a.key} onPress={() => { onClose(); setTimeout(a.run, 280); }} accessibilityRole="button" accessibilityLabel={a.label} style={[s.row, { backgroundColor: c.surface2, borderColor: c.line }]}>
              <View style={[s.ico, { backgroundColor: `${tone}22` }]}><Icon name={a.icon} size={18} color={tone} /></View>
              <Text variant="body" weight="bold" style={[s.flex, a.soft && { color: c.err }]}>{a.label}</Text>
              <Icon name="chevron-right" size={18} tone="gray" />
            </PressableScale>
          );
        })}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 24, gap: 10, paddingBottom: 24 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  ico: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
