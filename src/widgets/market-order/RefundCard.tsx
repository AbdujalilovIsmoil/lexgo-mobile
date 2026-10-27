import { StyleSheet, View } from "react-native";
import { useRefund } from "@/entities/market-flow";
import { Button, Icon, Pill, Skeleton, Text, type PillTone } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const TONE: Record<string, PillTone> = { pending: "warn", processing: "blue", succeeded: "ok", failed: "err", not_charged: "gray" };

// "Refund state" (TZ): where the order's refund stands — the amount in the response currency, the status, and "Manual processing" while
// no payment provider runs refunds (provider_enabled false). Shown while the order is being refunded and after; realtime refund events
// re-read it with the order.
export function RefundCard({ orderId, enabled }: { orderId: string; enabled: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  const q = useRefund(orderId, enabled);
  if (!enabled || (q.isSuccess && !q.data)) return null;
  const r = q.data;
  const word = (st: string) => (t(`mf.rf.status.${st}`) === `mf.rf.status.${st}` ? st.replace(/_/g, " ") : t(`mf.rf.status.${st}`));
  return (
    <SectionCard title={t("mf.rf.title")}>
      {q.isLoading ? <Skeleton height={56} round={14} /> : q.isError || !r ? (
        <View style={s.row}>
          <Text variant="small" tone="gray" style={s.flex}>{t("mf.rf.loadFailed")}</Text>
          <Button title={t("common.retry")} size="sm" variant="soft" icon="refresh-cw" onPress={() => void q.refetch()} />
        </View>
      ) : (
        <View style={s.col}>
          <View style={s.row}>
            <Text variant="h4" style={s.flex}>{`${fmtMoney(r.amount)} ${r.currency === "UZS" ? t("common.currency") : r.currency}`}</Text>
            <Pill label={word(r.status)} tone={TONE[r.status] ?? "gray"} small />
          </View>
          {r.manual && (r.status === "pending" || r.status === "processing") ? (
            <View style={[s.note, { backgroundColor: c.warnBg }]}>
              <Icon name="user-check" size={15} color={c.warn} />
              <View style={s.flex}>
                <Text variant="small" weight="semibold">{t("mf.rf.manual")}</Text>
                <Text variant="caption" tone="gray">{t("mf.rf.manualHint")}</Text>
              </View>
            </View>
          ) : null}
          {r.updatedAt ? <Text variant="caption" tone="gray2">{t("mf.rf.updated", { date: fmtDateTime(r.updatedAt, locale) })}</Text> : null}
        </View>
      )}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1, gap: 1 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 14 },
});
