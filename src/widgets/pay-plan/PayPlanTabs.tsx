import { StyleSheet, View } from "react-native";
import { Crown, History, type LucideIcon } from "lucide-react-native";
import { brand, useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type PayPlanTab = "plan" | "history";

const ITEMS: { key: PayPlanTab; icon: LucideIcon; label: string }[] = [
  { key: "plan", icon: Crown, label: "pps.tabPlan" },
  { key: "history", icon: History, label: "pps.tabHistory" },
];

// "Obuna · To'lovlar tarixi": two wide pills in one rounded track; the chosen one is filled with LexGo blue.
export function PayPlanTabs({ value, onChange }: { value: PayPlanTab; onChange: (v: PayPlanTab) => void }) {
  const { colors: c } = useTheme();
  const { t } = useT();
  return (
    <View accessibilityRole="tablist" style={[s.track, { backgroundColor: c.surface, borderColor: c.line }]}>
      {ITEMS.map(({ key, icon: Glyph, label }) => {
        const on = key === value;
        const fg = on ? "#FFFFFF" : c.ink;
        return (
          <PressableScale key={key} onPress={() => onChange(key)} scale={0.97} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={[s.item, on && [s.on, { backgroundColor: brand.b600, shadowColor: brand.b600 }]]}>
            <Glyph size={20} color={on ? fg : c.gray} strokeWidth={2} />
            <Text variant="small" weight="semibold" numberOfLines={1} style={[s.label, { color: fg }]}>{t(label)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  track: { flexDirection: "row", padding: 4, borderRadius: 999, borderWidth: 1, gap: 4 },
  item: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 999, paddingHorizontal: 10 },
  on: { shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  label: { fontSize: 15 },
});
