import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Icon, PressableScale, SheetScroll, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { LANGS } from "../model/useDutyFields";

// The document's language: a field that shows the current one; tapping it opens a bottom sheet with every
// language as a radio row (the sheet closes on a pick).
export function LangPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const c = useColors();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${t("dm7.langLabel")}: ${t(`dm7.lang.${value}`)}`} style={[s.field, { backgroundColor: c.surface2, borderColor: c.line }]}>
        <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name="globe" size={20} color={c.accent} /></View>
        <Text variant="body" weight="semibold" style={s.flex}>{t(`dm7.lang.${value}`)}</Text>
        <Icon name="chevron-down" size={20} color={c.gray2} />
      </PressableScale>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("dm7.langLabel")} snaps={[0.44, 0.7]}>
        <SheetScroll>
          {LANGS.map((l) => {
            const on = value === l;
            return (
              <PressableScale key={l} onPress={() => { selectHaptic(); onChange(l); setOpen(false); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
                <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={14} color="#FFFFFF" /> : null}</View>
                <Text variant="body" weight={on ? "bold" : "semibold"} style={s.flex}>{t(`dm7.lang.${l}`)}</Text>
              </PressableScale>
            );
          })}
        </SheetScroll>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  field: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingHorizontal: 12, borderRadius: radius.r, borderWidth: 1 },
  tile: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 60, paddingHorizontal: 16, borderRadius: radius.r, borderWidth: 1.5 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
