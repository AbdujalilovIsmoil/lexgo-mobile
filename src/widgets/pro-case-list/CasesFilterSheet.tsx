import { StyleSheet, View } from "react-native";
import { tOr } from "@/shared/lib/pro/tOr";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { BottomSheet, Button, IconButton, SheetOption, SheetScroll, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type CaseOption = { value: string; count: number };
const TINT: Record<string, string> = { open: "#22C55E", all: "#94A3B8", new: "#3B82F6", active: "#22C55E", investigation: "#F59E0B", court: "#EF4444", appeal: "#EC4899", completed: "#14B8A6", archived: "#94A3B8" };

// The case statuses in a sheet (coloured dot + live count), a pinned "reset" and "show N" bar.
export function CasesFilterSheet({ visible, onClose, value, onChange, options, total }: { visible: boolean; onClose: () => void; value: string; onChange: (v: string) => void; options: CaseOption[]; total: number }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const label = (v: string) => (v === "open" ? t("aw4.open") : v === "all" ? t("aw4.all") : tOr(t, `aw11.caseStatus.${v}`, v));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.7, 0.92]}>
      <View style={s.flex}>
        <SheetScroll>
          <Text variant="small" tone="gray">{t("mcs.status")}</Text>
          <View style={s.list}>{options.map((o) => <SheetOption key={o.value} on={value === o.value} label={label(o.value)} color={TINT[o.value] ?? c.gray} count={o.count} onPress={() => onChange(o.value)} />)}</View>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("mcs.reset")} onPress={() => onChange("open")} />
          <Button title={`${t("mcs.show")} · ${total}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ flex: { flex: 1 }, list: { gap: 2 }, bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 } });
