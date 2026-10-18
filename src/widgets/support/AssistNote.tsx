import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { AssistInfo, AssistKind } from "@/entities/support";

const ICON: Record<AssistKind, IconName> = { subscription_preview: "star", subscription_checkout: "credit-card", document_request: "file-text", marketplace_purchase: "briefcase", urgent_advokat: "zap" };

// A compact note in the ticket's timeline: "the operator prepared X for you". Tap → the full preview sheet.
export function AssistNote({ card, onPress }: { card: AssistInfo; onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  const tone = card.pay === "approved" ? c.ok : card.pay === "rejected" ? c.err : card.pay === "pending" ? c.warn : c.accent;
  const sub = [card.title, card.amount > 0 ? `${fmtMoney(card.amount)} ${t("adm.currency")}` : "", card.workId].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} style={[s.box, { backgroundColor: c.surface, borderColor: tone }]}>
      <View style={[s.icon, { backgroundColor: `${tone}22` }]}><Icon name={ICON[card.kind]} size={18} color={tone} /></View>
      <View style={s.fill}>
        <Text variant="caption" weight="bold" style={{ color: tone }}>{t("sp6.kicker")}</Text>
        <Text variant="small" weight="bold" numberOfLines={2}>{t(`sp6.title.${card.kind}`)}</Text>
        {sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text> : null}
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, marginVertical: 12 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  fill: { flex: 1, gap: 1 },
});
