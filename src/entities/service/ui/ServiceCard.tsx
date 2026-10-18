import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text } from "@/shared/ui";
import { usePriceLabel } from "../lib/usePriceLabel";
import type { Service } from "../model/types";

// Service card: gradient icon, title (up to 3 lines), area pill and price pill.
export function ServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
  const c = useColors();
  const price = usePriceLabel();
  return (
    <Card onPress={onPress} style={s.card}>
      <LinearGradient colors={["#1668F0", "#00A6E6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}>
        <Icon name={service.documentTemplateId ? "file-text" : "briefcase"} size={18} tone="white" />
      </LinearGradient>
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={3}>{service.name}</Text>
        <View style={s.meta}>
          {service.subcategory ? <Text variant="caption" tone="gray" numberOfLines={1} style={s.sub}>{service.subcategory}</Text> : <View style={s.sub} />}
          <Pill label={price(service)} tone={service.price ? "blue" : service.free ? "ok" : "gray"} small />
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={c.gray2} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 8 },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  sub: { flex: 1 },
});
