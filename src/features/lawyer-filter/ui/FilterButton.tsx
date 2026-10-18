import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { radius, shadows, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The web's "Filtrlar" pill with how many filters are on, and the directory's counters ("2 xizmat · 100 000 so'mdan") beside it.
export function FilterButton({ activeCount, onPress, note }: { activeCount: number; onPress: () => void; note?: string }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.wrap}>
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={t("mkw.toggle")} style={[s.btn, { backgroundColor: c.surface, borderColor: activeCount ? c.accent : c.line }, shadows.s1]}>
        <Icon name="sliders" size={17} color={c.accent} />
        <Text variant="small" weight="bold">{t("mkw.toggle")}</Text>
        {activeCount ? <View style={[s.badge, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" style={s.n}>{activeCount}</Text></View> : null}
      </PressableScale>
      {note ? <Text variant="caption" tone="gray" numberOfLines={2} style={s.note}>{note}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  note: { flex: 1, textAlign: "right" },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 1.5 },
  badge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  n: { color: "#FFFFFF", fontSize: 11 },
});
