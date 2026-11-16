import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text, Toggle } from "@/shared/ui";
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

// A service as a white card row (Adliya): the name, "price · status" under it and the few facts worth a glance (hidden, waiting for the
// rules, price capped, promoted) as small marks; the pencil and the quick on/off switch on the right. Notes, the corridor and the reasons live in the sheet that opens on tap.
export function ServiceRow({ item, onPress, onToggle, toggleDisabled, waiting, extra }: Props) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const som = useSom();
  const status = t(`proSvc.status.${item.status}`);
  const price = item.effectivePrice ? som(item.effectivePrice) : t("proSvc.form.noPriceTag");
  const on = item.status === "active";
  const line = [price, status.toLowerCase()].join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={[t("proSvc.rowA11y", { name: item.name, status, price }), item.rulesPending ? t("svcRules.rulesLockReason") : ""].filter(Boolean).join(". ")} style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.head}>
        <View style={s.col}>
          <Text variant="body" weight="semibold" numberOfLines={2} style={s.name}>{item.name || "—"}</Text>
          <Text variant="small" tone="gray" numberOfLines={1}>{line}</Text>
          {item.rulesPending || isCapped(item) || item.promotion || waiting || (on && !item.visible) ? (
            <View style={s.facts}>
              {on && !item.visible ? <Icon name="eye-off" size={14} color={c.warn} /> : null}
              {item.rulesPending ? <Icon name="lock" size={14} color={c.warn} /> : null}
              {isCapped(item) ? <Icon name="alert-triangle" size={14} color={c.warn} /> : null}
              {item.promotion ? <Pill label={t("proSvc.card.promotedDays", { days: item.promotion.daysLeft })} tone="cy" icon="radio" small /> : waiting ? <Icon name="clock" size={14} color={c.warn} /> : null}
            </View>
          ) : null}
        </View>
        <Icon name="edit-2" size={18} color={c.ink} />
        {onToggle ? <Toggle value={on} onChange={(v) => onToggle(v ? "active" : "paused")} disabled={toggleDisabled || !canEdit(item)} label={status} /> : null}
      </View>
      {extra}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  col: { flex: 1, minWidth: 0, gap: 3 },
  name: { fontSize: 16, lineHeight: 21 },
  facts: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
