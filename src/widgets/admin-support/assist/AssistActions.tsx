import { StyleSheet, View } from "react-native";
import type { AssistCaps } from "@/entities/admin-support";
import { Card, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type AssistSheetKey = "plan" | "doc" | "market" | "urgent";
const ITEMS: { key: AssistSheetKey; icon: IconName }[] = [{ key: "plan", icon: "credit-card" }, { key: "doc", icon: "file-text" }, { key: "market", icon: "briefcase" }, { key: "urgent", icon: "zap" }];

// "Act on behalf of the client": the four requests an operator can create; closed ones are greyed out.
export function AssistActions({ caps, onOpen }: { caps: AssistCaps; onOpen: (k: AssistSheetKey) => void }) {
  const { t } = useT();
  const c = useColors();
  const allowed: Record<AssistSheetKey, boolean> = { plan: caps.subscriptionCheckout, doc: caps.documentLawyerRequest, market: caps.marketplacePurchaseRequest, urgent: caps.urgentAdvokatRequest !== false };
  return (
    <Card style={s.card}>
      <Text variant="h4">{t("admSupB.tabs.label")}</Text>
      {ITEMS.map(({ key, icon }) => (
        <PressableScale key={key} onPress={() => onOpen(key)} disabled={!allowed[key]} style={[s.row, { backgroundColor: c.surface2, opacity: allowed[key] ? 1 : 0.5 }]}>
          <View style={[s.icon, { backgroundColor: c.tint2 }]}><Icon name={icon} size={19} tone="accent" /></View>
          <View style={s.col}>
            <Text variant="body" weight="bold">{t(`admSupB.tabs.${key}`)}</Text>
            <Text variant="caption" tone="gray">{allowed[key] ? t(`admSupB.tabs.hint.${key}`) : t("admSupB.tabs.off")}</Text>
          </View>
          <Icon name="chevron-right" size={18} tone="gray" />
        </PressableScale>
      ))}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
