import { StyleSheet, View } from "react-native";
import { brand, radius, useColors } from "@/shared/theme";
import { Button, Card, Icon, Pill, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { ServicePackage } from "../model/types";
import { IncludeList } from "./IncludeList";

const ICON: Record<string, IconName> = { BASIC: "package", STANDARD: "star", PREMIUM: "award" };
type Props = { pkg: ServicePackage; best: boolean; separately: number; onDetails: () => void; onOrder: () => void };

// One tariff: mark, name, price, saving vs. buying the services one by one, duration, what is in, two buttons.
export function TierCard({ pkg: p, best, separately, onDetails, onOrder }: Props) {
  const c = useColors();
  const { t } = useT();
  const key = `mk8.tiers.${p.tariff}`;
  const saves = separately > p.price ? separately - p.price : 0;
  return (
    <Card style={[s.card, best && { borderColor: brand.b600, borderWidth: 1.5 }]}>
      {best ? <Pill label={t("mk8.bestValue")} small /> : null}
      <View style={s.head}>
        <View style={[s.mark, { backgroundColor: c.surface2 }]}><Icon name={ICON[p.tariff] ?? "package"} size={18} tone="accent" /></View>
        <Text variant="h4" style={s.flex}>{t(key) !== key ? t(key) : p.tariff}</Text>
      </View>
      <Text variant="h2" tone="accent">{fmtMoney(p.price)} <Text variant="small" tone="gray2">{t("mk8.som")}</Text></Text>
      {saves ? <Text variant="small" weight="bold" tone="ok">{t("mk8.saves", { n: fmtMoney(saves) })}</Text> : null}
      {separately ? <Text variant="caption" tone="gray">{t("mk8.compare", { sep: fmtMoney(separately), pkg: fmtMoney(p.price) })}</Text> : null}
      {p.duration ? <View style={s.head}><Icon name="clock" size={14} tone="gray" /><Text variant="caption" tone="gray">{p.duration}</Text></View> : null}
      <IncludeList included={p.included} excluded={p.excluded} maxIn={3} maxOut={2} />
      <View style={s.head}>
        <Button title={t("mk8.details")} onPress={onDetails} variant="line" size="sm" style={s.flex} />
        <Button title={t("mk8.order")} onPress={onOrder} variant={best ? "gradient" : "primary"} size="sm" icon="arrow-right" iconRight style={s.flex} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: { width: 34, height: 34, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
