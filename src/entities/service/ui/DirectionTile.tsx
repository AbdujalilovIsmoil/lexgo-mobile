import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ServiceCategory } from "../model/types";
import { categoryIcon } from "../lib/categoryIcon";

const PALETTE: [string, string][] = [["#1668F0", "#00A6E6"], ["#6A4DFF", "#A98BFF"], ["#00A870", "#3DDC97"], ["#C2680A", "#FBC15E"], ["#E0457F", "#FF8DB8"]];

// A direction tile: full-bleed gradient, big watermark icon, name and counts.
export function DirectionTile({ category, index, onPress }: { category: ServiceCategory; index: number; onPress: () => void }) {
  const { t } = useT();
  const icon = categoryIcon(category);
  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(380)} style={s.cell}>
      <PressableScale onPress={onPress} scale={0.97} style={s.press}>
        <LinearGradient colors={PALETTE[index % PALETTE.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.tile}>
          <View style={s.mark}><Icon name={icon} size={92} color="rgba(255,255,255,0.18)" /></View>
          <View style={s.badge}><Icon name={icon} size={20} tone="white" /></View>
          <Text variant="h4" tone="white" numberOfLines={2}>{category.name}</Text>
          <Text variant="caption" style={s.count}>{t("services.servicesCount", { n: category.servicesCount })}</Text>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cell: { flex: 1 },
  press: { flex: 1 },
  tile: { flex: 1, minHeight: 138, borderRadius: 22, padding: 16, gap: 3, justifyContent: "flex-end", overflow: "hidden" },
  mark: { position: "absolute", right: -16, top: -14 },
  badge: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  count: { color: "rgba(255,255,255,0.85)" },
});
