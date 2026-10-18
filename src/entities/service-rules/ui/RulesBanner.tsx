import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Button, Icon, Skeleton, Text } from "@/shared/ui";
import { useServiceRules } from "../model/queries";
import { pendingCount } from "../lib/normalize";

type Props = { onOpen: () => void; serviceId?: string };

// Warning above the services list: shown only while some rules are not accepted (or while the status is
// loading / could not be loaded). Nothing renders once everything is accepted.
export function RulesBanner({ onOpen, serviceId }: Props) {
  const c = useColors();
  const { t } = useT();
  const q = useServiceRules(serviceId);
  const pending = pendingCount(q.data);

  if (q.isPending) return <View accessibilityLabel={t("svcRules.rulesChecking")}><Skeleton height={20} width="60%" /></View>;
  if (q.isError) {
    return (
      <View style={[s.box, { backgroundColor: c.surface2, borderColor: c.line }]} accessibilityRole="alert">
        <Icon name="alert-circle" size={18} color={c.gray} />
        <Text variant="small" tone="gray" style={s.flex}>{t("svcRules.rulesBannerError")}</Text>
        <Button title={t("svcRules.rulesRetry")} size="sm" variant="line" onPress={() => void q.refetch()} />
      </View>
    );
  }
  if (!pending) return null;
  return (
    <View style={[s.box, { backgroundColor: c.warnBg, borderColor: c.line }]} accessibilityRole="alert">
      <Icon name="alert-triangle" size={18} color={c.warn} />
      <View style={s.flex}>
        <Text variant="h4">{t("svcRules.rulesBannerTitle")}</Text>
        <Text variant="small" tone="gray">{t("svcRules.rulesBannerText", { n: pending })}</Text>
        <Button title={t("svcRules.rulesBannerAction")} size="sm" variant="primary" onPress={onOpen} style={s.action} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: radius.r, borderWidth: 1.5 },
  flex: { flex: 1, gap: 4 },
  action: { alignSelf: "flex-start", marginTop: 8, minHeight: 44 },
});
