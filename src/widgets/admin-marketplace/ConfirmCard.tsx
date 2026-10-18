import { View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { statusColor, useMktLabels, type MktConfirm } from "@/entities/admin-marketplace";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Telegram purchase-request confirm: status, who answered and per-chat delivery.
export function ConfirmCard({ item: c }: { item: MktConfirm }) {
  const { t, locale } = useT();
  const colors = useColors();
  const label = useMktLabels();
  const ok = c.deliveries.filter((x) => x.ok).length;
  return (
    <SectionCard>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="send" size={18} color={statusColor(c.status)} />
        <Text variant="body" weight="bold" style={{ flex: 1, color: statusColor(c.status) }}>{label.confirm(c.status)}</Text>
        {c.reviewedAt ? <Text variant="caption" tone="gray2">{fmtDateTime(c.reviewedAt, locale)}</Text> : null}
      </View>
      <FactRows rows={[
        { label: t("admMktC.reviewedBy"), value: c.reviewedByChatId },
        { label: t("admMktC.sentAt"), value: fmtDateTime(c.createdAt, locale) },
        { label: t("admMktC.category"), value: c.categoryTitle },
      ]} />
      {c.deliveries.length ? <Text variant="caption" tone="gray">{t("admMktC.delivered", { ok, n: c.deliveries.length })}</Text> : null}
      {c.deliveries.map((x) => (
        <View key={x.chatId} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name={x.ok ? "check" : "x"} size={14} color={x.ok ? colors.ok : colors.err} />
          <Text variant="caption" style={{ flex: 1 }} selectable>{x.chatId}{x.chatId === c.reviewedByChatId ? ` · ${t("admMktC.reviewer")}` : ""}{x.ok ? "" : ` · ${x.error || t("admMktC.deliveryFail")}`}</Text>
        </View>
      ))}
    </SectionCard>
  );
}
