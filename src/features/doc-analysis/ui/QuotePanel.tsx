import { StyleSheet, View } from "react-native";
import type { DocQuote } from "@/entities/doc-analysis";
import { fmtMoney } from "@/shared/lib/money";
import { Button, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";
import type { useQuote } from "../model/useQuote";

// The server's price for the current options (web .oquote), or the "Narxni hisoblash" button.
export function QuotePanel({ q, pageCount, pagesOk }: { q: ReturnType<typeof useQuote>; pageCount: number; pagesOk: boolean }) {
  const { t } = useT();
  const mark = useInstructorTarget("doc-analysis:quote", { label: t("cxDa.getQuote"), type: "section" });
  return (
    <View {...mark} style={s.col}>
      {q.fresh ? <Rows q={q.fresh} pages={q.fresh.pageCount || pageCount} /> : <Button title={q.busy ? t("cxDa.quoting") : t("cxDa.getQuote")} variant="line" full loading={q.busy} disabled={!pagesOk} onPress={() => void q.get()} />}
      {q.failed ? <Text variant="caption" tone="err">{q.why || t("cxDa.quoteError")}</Text> : null}
    </View>
  );
}

export function Rows({ q, pages }: { q: DocQuote; pages: number }) {
  const { t } = useT();
  const som = (n: number) => `${fmtMoney(n)} ${t("cxDa.som")}`;
  const extra = (label: string, n: number) => ({ label, value: n ? som(n) : undefined });
  return (
    <FactRows
      rows={[
        q.aiIncluded ? { label: t("cxDa.quoteAiIncluded", { n: pages }), value: t("cxDa.quoteIncluded") } : { label: t("cxDa.quoteBase", { n: pages }), value: som(q.baseAmount) },
        { label: t("cxDa.quoteIncludedPages", { n: q.includedPages }), value: q.includedPages ? (q.extraPages ? t("cxDa.quoteExtraPages", { n: q.extraPages }) : t("cxDa.quoteNoExtra")) : undefined },
        extra(t("cxDa.quoteOcr"), q.ocrAmount),
        extra(t("cxDa.quoteLawyer"), q.lawyerReviewAmount),
        extra(t("cxDa.quoteUrgent"), q.urgencyAmount),
        extra(t("cxDa.quoteWritten"), q.writtenOpinionAmount),
        { label: t("cxDa.quoteTotal"), value: <Text variant="body" weight="bold" tone="accent">{som(q.totalAmount)}</Text> },
      ]}
    />
  );
}

const s = StyleSheet.create({ col: { gap: 6 } });
