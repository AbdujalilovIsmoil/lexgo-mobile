import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text, Toggle } from "@/shared/ui";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import { canEdit, isCapped } from "../lib/rules";
import type { ProService, ServiceStatus } from "../model/types";

type Props = {
  item: ProService;
  onPress: () => void;
  onToggle?: (next: ServiceStatus) => void; // quick switch: active <-> paused
  toggleDisabled?: boolean;
  waiting?: boolean;
  extra?: ReactNode;
};

// A lean service card: name and category, the quick on/off switch, then one line with the price and the few facts worth a glance
// (listed or not, waiting for the rules, promoted, price capped). Notes, the corridor and the reasons live in the sheet that opens on tap.
export function ServiceRow({ item, onPress, onToggle, toggleDisabled, waiting, extra }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const status = t(`proSvc.status.${item.status}`);
  const price = item.effectivePrice ? som(item.effectivePrice) : t("proSvc.form.noPriceTag");
  const on = item.status === "active";
  const sub = [item.categoryTitle, item.subcategory].filter(Boolean).join(" · ") || t("proSvc.card.service");
  return (
    <Card onPress={onPress} accessibilityRole="button" accessibilityLabel={[t("proSvc.rowA11y", { name: item.name, status, price }), item.rulesPending ? t("svcRules.rulesLockReason") : ""].filter(Boolean).join(". ")} style={s.card}>
      <View style={s.head}>
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={2}>{item.name || "—"}</Text>
          <Text variant="caption" tone="gray2" numberOfLines={1}>{sub}</Text>
        </View>
        {onToggle ? <Toggle value={on} onChange={(v) => onToggle(v ? "active" : "paused")} disabled={toggleDisabled || !canEdit(item)} label={status} /> : null}
      </View>
      <View style={[s.foot, { borderTopColor: c.line }]}>
        <Text variant="h4" numberOfLines={1} style={s.price}>{price}</Text>
        <View style={s.facts}>
          {item.status !== "active" ? <Pill label={status} tone={item.status === "paused" ? "warn" : "gray"} small /> : null}
          {on ? <Icon name={item.visible ? "eye" : "eye-off"} size={16} color={item.visible ? c.ok : c.warn} /> : null}
          {item.rulesPending ? <Icon name="lock" size={16} color={c.warn} /> : null}
          {isCapped(item) ? <Icon name="alert-triangle" size={16} color={c.warn} /> : null}
          {item.promotion ? <Pill label={t("proSvc.card.promotedDays", { days: item.promotion.daysLeft })} tone="cy" icon="radio" small /> : waiting ? <Icon name="clock" size={16} color={c.warn} /> : null}
        </View>
      </View>
      {extra}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 16, minHeight: 44 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  col: { flex: 1, gap: 2 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, borderTopWidth: 1, paddingTop: 12 },
  price: { flexShrink: 1 },
  facts: { flexDirection: "row", alignItems: "center", gap: 10 },
});
