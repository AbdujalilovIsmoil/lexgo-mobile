import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moduleByKey, useRecentModules } from "@/entities/access";
import { useOpenModule } from "@/widgets/admin-drawer";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { lighten } from "@/shared/lib/color";
import { useT } from "@/shared/i18n";

// "Recently opened": the last sections as round shortcuts above the groups.
export function RecentRail({ visible }: { visible: Set<string> }) {
  const { t } = useT();
  const open = useOpenModule();
  const { keys, load } = useRecentModules();
  useEffect(() => { void load(); }, [load]);
  const mods = keys.filter((k) => visible.has(k)).flatMap((k) => { const m = moduleByKey(k); return m ? [m] : []; });
  if (!mods.length) return null;
  return (
    <>
      <Text variant="kicker" tone="gray2" style={s.kicker}>{t("admHub.recent").toUpperCase()}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {mods.map((m) => (
          <PressableScale key={m.key} onPress={() => open(m.key)} scale={0.92} style={s.item} accessibilityRole="button">
            <LinearGradient colors={[m.color, lighten(m.color)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.dot}><Icon name={m.icon} size={22} tone="white" /></LinearGradient>
            <Text variant="caption" weight="semibold" center numberOfLines={1}>{t(`admHub.mod.${m.key}.title`)}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  kicker: { paddingHorizontal: 20, marginTop: 4 },
  row: { paddingHorizontal: 16, gap: 14, paddingVertical: 10 },
  item: { width: 70, alignItems: "center", gap: 6 },
  dot: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});
