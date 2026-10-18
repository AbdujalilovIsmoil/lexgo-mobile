import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { Quote } from "../model/types";

type Props = { quote: Quote | null; pending: boolean; error: string; onRetry: () => void };

function Line({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  const { t } = useT();
  return (
    <View style={s.line}>
      <Text variant={bold ? "body" : "small"} weight={bold ? "bold" : "regular"} tone={bold ? "ink" : "gray"} style={s.flex}>{label}</Text>
      <Text variant={bold ? "h4" : "small"} weight="bold" tone={bold ? "accent" : "ink"}>{fmtMoney(value)} {t("common.currency")}</Text>
    </View>
  );
}

// The backend's quote: base price, every option's own amount (quote.breakdown) and total_price - the only total shown.
export function QuotePanel({ quote, pending, error, onRetry }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      {quote ? (
        <View style={s.col}>
          <Line label={t("ntd.po.base")} value={quote.basePrice} />
          {quote.lines.map((l) => <Line key={l.id} label={l.label} value={l.amount} />)}
          <View style={[s.rule, { backgroundColor: c.line }]} />
          <Line label={t("ntd.po.total")} value={quote.totalPrice} bold />
        </View>
      ) : pending ? <Skeleton height={64} round={14} /> : null}
      {pending && quote ? <Text variant="caption" tone="gray">{t("ntd.po.calc")}</Text> : null}
      {error ? <Text variant="small" tone="err">{error}</Text> : null}
      {error ? <Button title={t("ntd.po.retry")} onPress={onRetry} variant="line" size="sm" /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { padding: 14, borderRadius: 18, gap: 8 },
  col: { gap: 6 },
  line: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  rule: { height: 1, marginVertical: 2 },
});
