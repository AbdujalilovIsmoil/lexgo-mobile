import { StyleSheet, View } from "react-native";
import { useFinancials, type FinPayment, type Financials } from "@/entities/market-flow";
import { Button, Pill, Skeleton, Text, type PillTone } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

const TONE: Record<string, PillTone> = { paid: "ok", pending: "warn", failed: "err", cancelled: "gray", reversed: "gray", refunded: "gray", expired: "gray" };
const SETTLE_TONE: Record<string, PillTone> = { settled: "ok", released: "ok", ready_for_release: "ok", held: "warn", pending: "warn", complaint_hold: "err", rework_hold: "warn", refund_required: "err", refunded: "gray" };

type Props = { orderId: string; url: string; role: "client" | "seller"; enabled?: boolean };

// TZ §6 "Financials": the order's payment rows exactly as the backend lists them (stage + status), the plan of the financial snapshot
// and, for the seller, LexGo's commission, the net and the settlement — all backend figures, nothing is computed here.
export function PaymentsCard({ orderId, url, role, enabled = true }: Props) {
  const { t } = useT();
  const q = useFinancials(orderId, url, enabled && !!url);
  if (!url || !enabled) return null;
  const money = (n: number) => `${fmtMoney(n)} ${t("common.currency")}`;
  const word = (prefix: string, v: string, tones: Record<string, PillTone>) => {
    const key = `${prefix}.${v}`;
    const label = t(key) === key ? v.replace(/_/g, " ") : t(key);
    return <Pill label={label} tone={tones[v] ?? "gray"} small />;
  };
  return (
    <SectionCard title={t("mf.pay.title")}>
      {q.isLoading ? <Skeleton height={64} round={14} /> : q.isError || !q.data ? (
        <View style={s.err}>
          <Text variant="small" tone="gray" style={s.flex}>{t("mf.pay.loadFailed")}</Text>
          <Button title={t("common.retry")} size="sm" variant="soft" icon="refresh-cw" onPress={() => void q.refetch()} />
        </View>
      ) : (
        <Body f={q.data} role={role} money={money} word={word} />
      )}
    </SectionCard>
  );
}

type BodyProps = { f: Financials; role: "client" | "seller"; money: (n: number) => string; word: (prefix: string, v: string, tones: Record<string, PillTone>) => React.ReactNode };

function Body({ f, role, money, word }: BodyProps) {
  const { t } = useT();
  const label = (p: FinPayment) => {
    if (p.kind === "advance" && f.advance?.percent != null) return t("mf.pay.stage.advancePct", { pct: f.advance.percent });
    if (p.kind === "final" && f.final?.percent != null) return t("mf.pay.stage.finalPct", { pct: f.final.percent });
    return t(`mf.pay.stage.${p.kind}`);
  };
  // The split plan only means something until a single full payment covered the order.
  const split = !!f.advance && !!f.final && !f.payments.some((p) => p.kind === "full" && p.status === "paid");
  const planned = split ? (["advance", "final"] as const).filter((k) => !f.payments.some((p) => p.kind === k)) : [];
  return (
    <View style={s.col}>
      {f.payments.map((p) => (
        <View key={p.id || p.stage} style={s.row}>
          <View style={s.flex}>
            <Text variant="small" weight="semibold">{label(p)}</Text>
            <Text variant="caption" tone="gray">{money(p.amount)}{p.paid > 0 && p.paid < p.amount ? ` · ${t("mf.pay.status.paid")}: ${money(p.paid)}` : ""}</Text>
          </View>
          {word("mf.pay.status", p.status, TONE)}
        </View>
      ))}
      {planned.map((k) => {
        const part = k === "advance" ? f.advance : f.final;
        return part ? (
          <View key={k} style={s.row}>
            <View style={s.flex}>
              <Text variant="small" weight="semibold">{part.percent != null ? t(`mf.pay.stage.${k}Pct`, { pct: part.percent }) : t(`mf.pay.stage.${k}`)}</Text>
              <Text variant="caption" tone="gray">{money(part.amount)}</Text>
            </View>
            <Pill label={t("mf.pay.planned")} tone="gray" small />
          </View>
        ) : null;
      })}
      {!f.payments.length && !planned.length ? <Text variant="small" tone="gray">{t("mf.pay.empty")}</Text> : null}
      <FactRows rows={[
        { label: t("mf.pay.total"), value: f.gross > 0 ? money(f.gross) : undefined },
        ...(role === "seller" && f.commission ? [
          { label: f.commission.percent != null ? `${t("mf.pay.commission")} (${f.commission.percent}%)` : t("mf.pay.commission"), value: f.commission.platform > 0 ? money(f.commission.platform) : undefined },
          { label: t("mf.pay.net"), value: f.commission.net > 0 ? money(f.commission.net) : undefined },
        ] : []),
        ...(role === "seller" && f.settlement ? [{ label: t("mf.pay.settlement"), value: word("mf.pay.settle", f.settlement, SETTLE_TONE) }] : []),
      ]} />
      {split && f.advance?.percent != null && f.final?.percent != null ? <Text variant="caption" tone="gray">{t("mf.pay.plan", { a: f.advance.percent, b: f.final.percent })}</Text> : null}
      <Text variant="caption" tone="gray2">{f.historical ? t("mf.pay.historical") : t("mf.pay.fixed")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1, gap: 1 },
  err: { flexDirection: "row", alignItems: "center", gap: 10 },
});
