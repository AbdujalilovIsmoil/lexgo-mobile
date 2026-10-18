import { StyleSheet, View } from "react-native";
import type { LawyerService } from "@/entities/lawyer";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { deliveryLabel } from "./deliveryLabel";

type Props = { service: LawyerService; disabled: boolean; label: string; onBuy: () => void };

// One service he sells: title, category, delivery time, price and its own "Buy".
export function ServiceRow({ service: sv, disabled, label, onBuy }: Props) {
  const { t } = useT();
  const eta = deliveryLabel(t, sv.deliveryMinutes);
  return (
    <Card style={s.card}>
      <View style={s.top}>
        <Text variant="body" weight="bold" numberOfLines={3} style={s.flex}>{sv.title}</Text>
        <Text variant="h4" tone={sv.price ? "accent" : "gray2"}>{sv.price ? fmtMoney(sv.price) : t("mk2.priceAsk")}</Text>
      </View>
      <View style={s.meta}>
        {sv.sponsored ? <Pill label={t("mk1.ad")} tone="cy" icon="trending-up" small /> : null}
        {sv.category ? <Text variant="caption" tone="gray">{sv.category}</Text> : null}
        {eta ? <View style={s.eta}><Icon name="clock" size={12} tone="gray" /><Text variant="caption" tone="gray">{eta}</Text></View> : null}
      </View>
      {sv.note ? <Text variant="caption" tone="gray2">{sv.note}</Text> : null}
      <Button title={label} onPress={onBuy} disabled={disabled || !sv.price} variant="soft" size="sm" icon="shopping-bag" />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8, padding: 14 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  flex: { flex: 1 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  eta: { flexDirection: "row", alignItems: "center", gap: 4 },
});
