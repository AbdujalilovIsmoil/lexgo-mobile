import { StyleSheet, View } from "react-native";
import type { PayGroup } from "@/entities/payment";
import { BottomSheet, SheetOption, Button, IconButton, SheetScroll, Text } from "@/shared/ui";
import { DateField, type DateRange, type DatePreset } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

const GROUPS: PayGroup[] = ["all", "pending", "paid", "failed", "refunded"];
const PERIODS: DatePreset[] = ["all", "today", "d7", "d30", "d90", "custom"];
type Props = { visible: boolean; onClose: () => void; group: PayGroup; onGroup: (g: PayGroup) => void; counts: Record<PayGroup, number>; bar: DateRange; total: number; onReset: () => void };

// Status (coloured dot + live count) and period in one sheet, a pinned "reset" + "show N" bar; custom period reveals two dates.
export function PaymentFilterSheet({ visible, onClose, group, onGroup, counts, bar, total, onReset }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const dot: Record<string, string> = { all: c.gray, pending: c.warn, paid: c.ok, failed: c.err, refunded: c.gray2 };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("pyx.status")}</Text>
            {GROUPS.map((g) => <SheetOption key={g} on={group === g} label={t(`py1.group.${g}`)} color={dot[g]} count={counts[g]} onPress={() => onGroup(g)} />)}
          </View>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("pyx.period")}</Text>
            {PERIODS.map((p) => <SheetOption key={p} on={bar.preset === p} label={t(`adm.${p}`)} onPress={() => bar.setPreset(p)} />)}
            {bar.preset === "custom" ? (
              <View style={s.dates}>
                <View style={s.flex}><DateField label={t("adm.from")} value={bar.from} onChange={bar.setFrom} /></View>
                <View style={s.flex}><DateField label={t("adm.to")} value={bar.to} onChange={bar.setTo} /></View>
              </View>
            ) : null}
          </View>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("dm1.reset")} onPress={onReset} />
          <Button title={`${t("dm11.fShow")} · ${total}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 2, marginBottom: 14 },
  dates: { flexDirection: "row", gap: 10, marginTop: 8 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
