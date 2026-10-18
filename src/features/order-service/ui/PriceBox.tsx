import { StyleSheet, View } from "react-native";
import type { PriceModifier, PriceQuote } from "@/entities/order";
import { Card, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { quote?: PriceQuote; loading: boolean; price?: number };

const slug = (k: string) => k.replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());

// Final price of the order: the backend quote line by line once an advocate is picked, else the
// catalogue price (or "by request").
export function PriceBox({ quote, loading, price }: Props) {
  const { t } = useT();
  const som = (n: number) => `${fmtMoney(n)} ${t("common.currency")}`;
  const label = (m: PriceModifier) => {
    const tr = t(`csv.modifiers.${m.key}`);
    return m.key && !tr.startsWith("csv.") ? tr : m.label || slug(m.key) || "—";
  };
  const value = (m: PriceModifier) => (m.percent ? `${m.percent > 0 ? "+" : ""}${m.percent}%` : m.multiplier && m.multiplier !== 1 ? `×${Number(m.multiplier.toFixed(2))}` : m.amount ? som(m.amount) : "×1");
  const row = (k: string, v: string, tone?: "ok" | "accent", bold?: boolean) => (
    <View style={s.row} key={k + v}><Text variant="small" tone="gray" style={s.k}>{k}</Text><Text variant={bold ? "h4" : "small"} weight="semibold" tone={tone ?? "ink"}>{v}</Text></View>
  );
  if (!quote) {
    return <Card tinted style={s.card}>{row(t("csv.price"), loading ? t("csv.priceCalc") : price ? som(price) : t("csv.byRequest"), "accent", true)}</Card>;
  }
  const disc = quote.referralPercent || quote.discountAmount;
  return (
    <Card tinted style={s.card}>
      {quote.baseAmount && quote.baseAmount !== quote.totalAmount ? row(t("csv.priceBase"), som(quote.baseAmount)) : null}
      {quote.modifiers.map((m) => row(label(m), value(m)))}
      {quote.subtotal && quote.subtotal !== quote.totalAmount && quote.subtotal !== quote.baseAmount ? row(t("csv.priceSubtotal"), som(quote.subtotal)) : null}
      {disc ? row(`${t("csv.referralDiscount")}${quote.referralPercent && quote.discountAmount ? ` (−${quote.referralPercent}%)` : ""}`, quote.discountAmount ? `−${som(quote.discountAmount)}` : `−${quote.referralPercent}%`, "ok") : null}
      {row(t("csv.priceTotal"), som(quote.totalAmount), "accent", true)}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  k: { flex: 1 },
});
