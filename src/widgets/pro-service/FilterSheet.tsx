import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SERVICE_STATUSES, countBy, statusColor, type ProService, type ServiceFilter } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { BottomSheet, Button, SheetOption } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; items: ProService[]; value: ServiceFilter; onApply: (f: ServiceFilter) => void };

// Status filter in a bottom sheet: radio rows with counts, "Tozalash" resets, "Qo'llash" applies.
export function FilterSheet({ visible, onClose, items, value, onApply }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [draft, setDraft] = useState<ServiceFilter>(value);
  useSheetReset(visible, () => setDraft(value));
  const n = countBy(items);
  const rows: { value: ServiceFilter; label: string; count: number; color?: string }[] = [
    { value: "all", label: t("proSvc.filters.all"), count: n.all },
    ...SERVICE_STATUSES.map((st) => ({ value: st as ServiceFilter, label: t(`proSvc.filters.${st}`), count: n[st], color: statusColor(c, st) })),
  ];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("proSvc.filter.title")} subtitle={t("proSvc.filters.label")} snaps={[0.62]}>
      <View style={s.body} accessibilityRole="radiogroup">
        {rows.map((r) => <SheetOption key={r.value} on={draft === r.value} label={r.label} count={r.count} color={r.color} onPress={() => setDraft(r.value)} />)}
      </View>
      <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 10 }]}>
        <Button title={t("proSvc.filter.reset")} variant="line" onPress={() => setDraft("all")} style={s.half} full />
        <Button title={t("proSvc.filter.apply")} variant="gradient" onPress={() => { onApply(draft); onClose(); }} style={s.half} full />
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 10, gap: 6 },
  bar: { flexDirection: "row", gap: 10, paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
  half: { flex: 1 },
});
