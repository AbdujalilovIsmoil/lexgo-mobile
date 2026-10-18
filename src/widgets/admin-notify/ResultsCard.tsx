import { View } from "react-native";
import { DeliveryChips, type Summary } from "@/entities/admin-notify";
import { RowCard } from "@/shared/ui/admin";
import { Button, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { summary: Summary; failed?: number; onRetry?: () => void };

// What happened to each recipient: sent / not sent (with the reason), per-channel delivery status, retry of the failures.
export function ResultsCard({ summary, failed, onRetry }: Props) {
  const { t } = useT();
  const ok = summary.results.filter((r) => r.ok).length;
  const queued = summary.results.some((r) => r.deliveries.some((d) => d.tone === "pending"));
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admNtfC.results", { ok, total: summary.results.length })}</Text>
      {summary.results.map((r) => (
        <RowCard key={r.id} icon={r.ok ? "check-circle" : "x-circle"} tint={r.ok ? "#22C55E" : "#EF4444"} title={r.name} right={<Pill label={r.ok ? t("admNtfC.sent") : t("admNtfC.failed")} tone={r.ok ? "ok" : "err"} small />}>
          {r.ok ? <DeliveryChips items={r.deliveries} /> : r.reason ? <Text variant="caption" tone="err">{r.reason}</Text> : null}
        </RowCard>
      ))}
      {failed && onRetry ? <Button title={t("admNtfB.retry", { n: failed })} icon="refresh-cw" variant="soft" full onPress={onRetry} /> : null}
      {queued ? <Text variant="caption" tone="gray">{t("admNtfC.queuedNote")}</Text> : null}
    </View>
  );
}
