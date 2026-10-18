import { StyleSheet, View } from "react-native";
import { SOS_CATEGORIES, type SosCategory } from "@/entities/sos";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

// "Vaziyat turi": six tiles in two columns, icon beside the name (web .sos2__cats); a tap selects one.
export function CategoryGrid({ value, onChange }: { value: SosCategory | ""; onChange: (c: SosCategory) => void }) {
  const c = useColors();
  const { t } = useT();
  const mark = useInstructorTarget("sos:categories", { label: t("cxSos.catLabel"), type: "list" });
  return (
    <View {...mark} style={s.grid}>
      {SOS_CATEGORIES.map(({ key, icon }) => {
        const on = value === key;
        return (
          <PressableScale key={key} onPress={() => onChange(key)} style={[s.tile, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.tint : c.surface }]} accessibilityRole="button" accessibilityState={{ selected: on }}>
            <View style={[s.ico, { backgroundColor: on ? c.accent : c.tint2 }]}><Icon name={icon} size={18} color={on ? "#FFFFFF" : c.accent} /></View>
            <Text variant="small" weight="semibold" style={s.label}>{t(`cxSos.cat.${key}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: radius.r, borderWidth: 1.5 },
  label: { flex: 1 },
  ico: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
