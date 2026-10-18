import { Pill, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { UrgentRequest } from "@/entities/urgent";

const PAID = ["paid", "approved", "confirmed", "completed"];
const OPEN = ["pending", "pending_confirmation", "awaiting_payment", "awaiting_confirmation", "created"];

// The payment step as the backend reports it. Never decided here: a pending step waits for the Telegram approval
// and the realtime/refetch status (TZ 27) — the client can not mark anything paid.
export function PaymentNote({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const p = req.payment;
  if (!p) return null;
  const status = p.status.toLowerCase();
  const key = `ug4.pay.${status}`;
  const text = t(key);
  return (
    <>
      <Pill tone={PAID.includes(status) ? "ok" : OPEN.includes(status) ? "warn" : "gray"} icon="credit-card" label={`${text === key ? p.status : text}${p.amount ? ` · ${fmtMoney(p.amount)} ${t("adm.currency")}` : ""}`} />
      {OPEN.includes(status) ? <Text variant="caption" tone="gray">{t("ug4.payWait")}</Text> : null}
    </>
  );
}
