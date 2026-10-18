import { FactRows } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { DocQuote } from "../model/types";

// Server-calculated price of an advocate review for the measured page count.
export function QuoteRows({ quote: q }: { quote: DocQuote }) {
  const { t } = useT();
  const som = (n: number) => `${fmtMoney(n)} ${t("common.currency")}`;
  return (
    <FactRows
      rows={[
        { label: t("dc8.q.pages"), value: String(q.pageCount) },
        { label: t("dc8.q.included", { n: q.includedPages }), value: q.extraPages ? t("dc8.q.extra", { n: q.extraPages }) : t("dc8.q.noExtra") },
        { label: t("dc8.q.review"), value: som(q.lawyerReviewAmount) },
        { label: t("dc8.q.urgent"), value: q.urgencyAmount ? `+ ${som(q.urgencyAmount)}` : undefined },
        { label: t("dc8.q.total"), value: <Text variant="body" weight="bold" tone="accent">{som(q.totalAmount)}</Text> },
      ]}
    />
  );
}
