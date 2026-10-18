import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Icon, Text } from "@/shared/ui";
import type { RetCtx } from "../useRetentionCtx";

// Upsell suggestions as a swipeable rail of offer cards (name, why, price).
export function UpsellRail({ x }: { x: RetCtx }) {
  const { t, fmt, d } = x;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admRet.upsellTitle")}</Text>
      {d.upsell.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} style={s.bleed}>
          {d.upsell.map((u, i) => (
            <Card key={u.id || i} style={s.card}>
              <LinearGradient colors={["#16A34A", "#4ADE80"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}><Icon name="gift" size={18} tone="white" /></LinearGradient>
              <Text variant="body" weight="bold" numberOfLines={2}>{u.name}</Text>
              {u.suggestion ? <Text variant="caption" tone="gray" numberOfLines={3}>{u.suggestion}</Text> : null}
              {u.price ? <Text variant="small" weight="bold" tone="accent">{fmt.money(u.price)}</Text> : null}
            </Card>
          ))}
        </ScrollView>
      ) : <Text variant="small" tone="gray">{t("admRet.noUpsell")}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  bleed: { marginHorizontal: -16 },
  row: { paddingHorizontal: 16, gap: 10 },
  card: { width: 190, gap: 6, padding: 14 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 2 },
});
