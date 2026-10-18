import { View } from "react-native";
import { useCcLabel, type ClientCard } from "@/entities/admin-callcenter";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

// Payments summary (count and total paid) and the payments themselves. Read-only: an operator never confirms a payment.
export function PaymentsTab({ card }: { card: ClientCard }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const paid = card.payments.filter((p) => p.status === "paid").length;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="small" tone="gray">{t("cc2.paySummary", { n: card.summary.payments || card.payments.length, paid, sum: fmtMoney(card.summary.spent), cur: t("adm.currency") })}</Text>
      <MoreRows
        items={card.payments}
        empty={t("admCcC.none.payments")}
        render={(p) => (
          <RowCard key={p.id} icon="credit-card" title={`${fmtMoney(p.amount)} ${t("adm.currency")}`} subtitle={p.description || label("admCcC.payKind", p.kind)} meta={fmtDateTime(p.createdAt, locale)} right={<StatusPill status={p.status} />} />
        )}
      />
    </View>
  );
}
