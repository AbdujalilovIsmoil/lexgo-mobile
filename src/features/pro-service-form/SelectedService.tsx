import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { PickedService } from "./types";

type Props = { service: PickedService; onChange?: () => void };

// The chosen catalogue service as a selected card, with the "O'zgartirish" action (only while adding).
export function SelectedService({ service, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.tint, borderColor: c.accent }]} accessibilityLabel={`${t("proSvc.formUi.selected")}: ${service.name}`}>
      <View style={[s.tick, { backgroundColor: c.accent }]}><Icon name="check" size={16} tone="white" /></View>
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={3}>{service.name}</Text>
        {service.category ? <Text variant="caption" tone="gray" numberOfLines={2}>{service.category}</Text> : null}
        {service.catalogPrice ? <Text variant="caption" tone="gray">{t("proSvc.card.catalogPrice")}: {fmtMoney(service.catalogPrice)} {t("proSvc.form.som")}</Text> : null}
      </View>
      {onChange ? <Button title={t("proSvc.form.change")} variant="ghost" size="sm" onPress={onChange} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.r, borderWidth: 1.5, minHeight: 64 },
  tick: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
