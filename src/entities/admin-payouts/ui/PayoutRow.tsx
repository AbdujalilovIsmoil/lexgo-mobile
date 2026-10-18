import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { payoutTint } from "../model/tint";
import type { Payout } from "../model/types";

type Props = { item: Payout; onPress: () => void; onPay?: () => void };

// One payout as a ticket: status colour strip, seller share as the headline, gross and fees underneath, a round "paid" button.
export function PayoutRow({ item, onPress, onPay }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  return (
    <CcTicket
      tint={payoutTint(c, item.status)}
      icon="credit-card"
      title={`${fmtMoney(item.sellerShare)} ${t("adm.currency")}`}
      subtitle={`${t("admPay.gross")}: ${fmtMoney(item.gross)} · ${t("admPay.fees")}: ${fmtMoney(item.platformFee + item.providerFee)}`}
      badge={<StatusPill status={item.status} />}
      chips={<><Pill small tone="gray" icon="calendar" label={fmtDate(item.createdAt, locale)} />{item.note ? <Pill small tone="gray" icon="message-square" label={item.note} /> : null}</>}
      actions={item.status !== "paid" && onPay ? <CcAction primary icon="check" label={t("admPay.markPaid")} onPress={onPay} /> : undefined}
      onPress={onPress}
    />
  );
}
