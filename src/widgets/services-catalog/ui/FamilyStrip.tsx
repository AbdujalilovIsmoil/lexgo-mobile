import { ScrollView, StyleSheet, View } from "react-native";
import type { ServiceCategory } from "@/entities/service";
import { brand, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { cats: ServiceCategory[]; value: string; onChange: (id: string) => void; subs: Map<string, number>; subTotal: number; svcTotal: number };

function Tab({ on, title, n, onPress }: { on: boolean; title: string; n: number; onPress: () => void }) {
  const c = useColors();
  return (
    <PressableScale onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tab, { backgroundColor: on ? brand.b600 : c.surface, borderColor: on ? brand.b600 : c.line }]}>
      <Text variant="small" weight="bold" numberOfLines={1} style={{ color: on ? "#FFFFFF" : c.ink }}>{title}</Text>
      {n ? <View style={[s.n, { backgroundColor: on ? "rgba(255,255,255,0.24)" : c.tint2 }]}><Text variant="caption" weight="bold" style={{ color: on ? "#FFFFFF" : c.accent }}>{n}</Text></View> : null}
    </PressableScale>
  );
}

// The legal areas as one row of pills with their counts ("All" clears it) - one tap to narrow the directions below.
export function FamilyStrip({ cats, value, onChange, subs, subTotal }: Props) {
  const { t } = useT();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} accessibilityLabel={t("csv.filterCategory")}>
      <Tab on={!value} title={t("csv.allFamilies")} n={subTotal} onPress={() => onChange("")} />
      {cats.map((x) => <Tab key={x.id} on={value === x.id} title={x.name} n={x.subcategoriesCount || subs.get(x.id) || 0} onPress={() => onChange(x.id)} />)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 8, paddingRight: 8 },
  tab: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingLeft: 16, paddingRight: 10, borderRadius: 999, borderWidth: 1.5 },
  n: { minWidth: 24, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
});
