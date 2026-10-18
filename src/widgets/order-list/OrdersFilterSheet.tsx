import { StyleSheet, View } from "react-native";
import { BottomSheet, SheetOption, Button, IconButton, SheetScroll, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { SORTS, STAGE_TABS, type useMyOrders } from "./useMyOrders";

type Props = { visible: boolean; onClose: () => void; m: ReturnType<typeof useMyOrders> };

// Status (a list with a coloured dot and a live count) and sort in one sheet, with a pinned "reset" + "show N" bar.
export function OrdersFilterSheet({ visible, onClose, m }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const dot: Record<string, string> = { all: c.gray, pending: c.warn, active: c.accent, completed: c.ok, cancelled: c.gray2 };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.7, 0.9]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("ods.stage")}</Text>
            {STAGE_TABS.map((k) => <SheetOption key={k} on={m.stage === k} label={t(`mk4.tabs.${k}`)} color={dot[k]} count={m.counts[k]} onPress={() => m.setStage(k)} />)}
          </View>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("ods.sort")}</Text>
            {SORTS.map((k) => <SheetOption key={k} on={m.sort === k} label={t(`ods.${k}`)} onPress={() => m.setSort(k)} />)}
          </View>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("dm1.reset")} onPress={m.reset} />
          <Button title={`${t("dm11.fShow")} · ${m.shown.length}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 2, marginBottom: 14 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
