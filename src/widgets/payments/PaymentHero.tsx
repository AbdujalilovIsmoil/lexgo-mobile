import { StyleSheet } from "react-native";
import { fmtUzs, paymentTitle, PaymentStatusPill, type PaymentRow } from "@/entities/payment";
import { Card, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Amount, what it was for, when, and the backend's status.
export function PaymentHero({ p }: { p: PaymentRow }) {
  const { t, locale } = useT();
  return (
    <Card tinted style={s.card}>
      <Text variant="small" tone="gray">{paymentTitle(p, t)}</Text>
      <Text variant="hx">{fmtUzs(p.amount, t)}</Text>
      <PaymentStatusPill status={p.status} method={p.method} small={false} />
      <Text variant="caption" tone="gray2">{fmtDateTime(p.createdAt, locale)}</Text>
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 6, alignItems: "flex-start" } });
