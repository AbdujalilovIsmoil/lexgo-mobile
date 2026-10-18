import { StyleSheet } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { fmtDateTime } from "@/shared/lib/format";

// The seller asked for more: the work is paused until this payment is confirmed in Telegram (valid 24 h).
export function AddPayNote({ order: o }: { order: MarketOrder }) {
  const { t, locale } = useT();
  const a = o.addPay;
  if (!a || o.status !== "waiting_payment" || a.status === "paid") return null;
  return (
    <Card tinted style={s.card}>
      <Text variant="body" weight="bold">{t("ntd.od.addTitle")}</Text>
      <Text variant="small" tone="gray">{t("ntd.od.addText")}</Text>
      {a.amount ? <Text variant="h4" tone="accent">{fmtMoney(a.amount)} {t("common.currency")}</Text> : null}
      {a.expiresAt ? <Text variant="caption" tone="gray">{t("ntd.od.addUntil", { when: fmtDateTime(a.expiresAt, locale) })}</Text> : null}
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 6, padding: 14 } });
