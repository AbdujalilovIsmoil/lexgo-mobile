import { StyleSheet, View } from "react-native";
import { visibilityChecks, type ProService } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Marketplace'da ko'rinish": the verdict and the four conditions as a checklist, so it is obvious what is missing.
export function VisibilityCard({ item, verified }: { item: ProService; verified: boolean }) {
  const { t } = useT();
  const c = useColors();
  const checks = visibilityChecks(item, verified);
  const shown = item.visible;
  return (
    <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={s.head}>
        <View style={[s.ic, { backgroundColor: shown ? c.okBg : c.warnBg }]}><Icon name={shown ? "eye" : "eye-off"} size={18} color={shown ? c.ok : c.warn} /></View>
        <View style={s.flex}>
          <Text variant="body" weight="bold">{t("proSvc.sheet.visibility")}</Text>
          <Text variant="caption" tone={shown ? "ok" : "warn"}>{shown ? t("proSvc.card.visible") : t("proSvc.sheet.notListed")}</Text>
        </View>
      </View>
      {checks.map((x) => (
        <View key={x.key} style={s.row} accessible accessibilityLabel={`${t(`proSvc.sheet.check.${x.key}`)}: ${x.ok ? t("proSvc.sheet.met") : t("proSvc.sheet.unmet")}`}>
          <Icon name={x.ok ? "check-circle" : "x-circle"} size={18} color={x.ok ? c.ok : c.err} />
          <Text variant="small" tone={x.ok ? "ink" : "err"} style={s.flex}>{t(`proSvc.sheet.check.${x.key}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: 20, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 2 },
  ic: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 28 },
  flex: { flex: 1 },
});
