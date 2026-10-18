import type { AssistContext, AssistSent } from "@/entities/admin-support";
import { docPhaseNow } from "@/entities/admin-support";
import { useT } from "@/shared/i18n";
import { PayState } from "./PayState";
import { ResultCard } from "./ResultCard";
import { useResultRows } from "./useResultRows";
import { useSum } from "./useSum";

type Doc = Extract<AssistSent, { kind: "doc" }>;

// Document request: shows whether it still waits for payment approval or already sits in the lawyers' pool.
export function DocResultCard({ s, ctx, onDismiss }: { s: Doc; ctx: AssistContext; onDismiss: () => void }) {
  const { t } = useT();
  const sum = useSum();
  const r = useResultRows();
  const d = s.data;
  const ctxDoc = ctx.docs.find((x) => (d.requestId && x.id === d.requestId) || (d.workId && x.workId === d.workId));
  const phase = docPhaseNow(d, ctxDoc);
  const waiting = phase === "pending" || phase === "rejected";
  const mode = d.assignmentMode && t(`admSupC.doc.mode.${d.assignmentMode}`) !== `admSupC.doc.mode.${d.assignmentMode}` ? t(`admSupC.doc.mode.${d.assignmentMode}`) : d.assignmentMode;
  return (
    <ResultCard
      title={waiting ? t("admSupC.doc.sentPayTitle") : t("admSupC.doc.sentTitle")}
      warn={!d.telegramSent || phase === "rejected"}
      note={phase === "pending" ? t("admSupB.pay.docPending") : phase === "rejected" ? t("admSupB.pay.rejectedNote") : t("admSupC.doc.poolNote")}
      onDismiss={onDismiss}
      rows={[
        r.work(d.workId),
        { label: t("adm.title"), value: d.title },
        waiting ? { label: "", value: "" } : r.status(ctxDoc?.status || d.poolStatus || d.status),
        { label: t("admSupB.result.mode"), value: mode || "—" },
        r.tg(d.telegramSent),
        { label: t("admSupC.doc.payment"), value: !phase && d.price > 0 ? (d.paid ? t("admSupC.doc.paid") : `${t("admSupC.doc.unpaid")} · ${sum(d.price, d.currency)}`) : "" },
      ]}
    >
      <PayState phase={phase} amount={d.gate?.amount || d.price} currency={d.gate?.currency || d.currency} />
    </ResultCard>
  );
}
