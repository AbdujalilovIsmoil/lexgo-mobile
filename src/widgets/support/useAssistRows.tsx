import { Pill } from "@/shared/ui";
import type { Fact } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { AssistInfo } from "@/entities/support";

const TONE = { pending: "warn", approved: "ok", rejected: "err" } as const;

// The facts of an assist card, in the order a client reads them: what, how much, how long, which ids, state.
export function useAssistRows(card: AssistInfo | null, ticketWorkId: string): Fact[] {
  const { t } = useT();
  if (!card) return [];
  const money = (n: number) => `${fmtMoney(n)} ${card.currency === "UZS" ? t("adm.currency") : card.currency}`;
  const pk = `sp6.period.${card.billingPeriod}`;
  const period = card.billingPeriod ? (t(pk) !== pk ? t(pk) : humanizeSlug(card.billingPeriod)) : "";
  const state = card.pay ? <Pill label={t(`sp6.pay.${card.pay}`)} tone={TONE[card.pay]} small /> : card.status ? <Pill label={card.status.replace(/_/g, " ")} tone="gray" small /> : undefined;
  return [
    { label: t(`sp6.row.${card.kind}`), value: card.title },
    { label: t("sp6.row.amount"), value: card.amount > 0 ? money(card.amount) : "" },
    { label: t("sp6.row.discount"), value: card.discountPercent > 0 ? `${card.discountPercent}%` : "" },
    { label: t("sp6.row.period"), value: period ? (card.months > 1 ? `${period} · ${t("sp6.months", { n: card.months })}` : period) : "" },
    { label: t("sp6.row.workId"), value: card.workId },
    { label: t("sp6.row.ticket"), value: ticketWorkId },
    { label: t("sp6.row.status"), value: state },
  ];
}
