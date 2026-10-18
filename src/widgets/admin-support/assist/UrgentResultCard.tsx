import type { AssistSent } from "@/entities/admin-support";
import { urgentPayPhase } from "@/entities/admin-support";
import { useT } from "@/shared/i18n";
import { PayState } from "./PayState";
import { ResultCard } from "./ResultCard";
import { useResultRows } from "./useResultRows";
import { useSum } from "./useSum";

type Urgent = Extract<AssistSent, { kind: "urgent" }>;

// Urgent-lawyer request: in the duty queue, the client already knows.
export function UrgentResultCard({ s, onDismiss }: { s: Urgent; onDismiss: () => void }) {
  const { t } = useT();
  const sum = useSum();
  const r = useResultRows();
  const u = s.data;
  const phase = urgentPayPhase(u);
  const note = [u.clientNotified !== false ? `✓ ${t("admSupB.result.notified")}` : "", phase === "rejected" ? t("admSupB.pay.rejectedNote") : u.immediateCall ? t("admSupC.urgent.callNote") : t("admSupC.urgent.poolNote")].filter(Boolean).join(" ");
  return (
    <ResultCard
      title={t("admSupC.urgent.sentTitle")}
      warn={phase === "rejected" || !u.telegramSent}
      note={note}
      onDismiss={onDismiss}
      rows={[
        u.workId ? r.work(u.workId) : { label: t("admSupB.result.requestId"), value: u.id || "—" },
        { label: t("admSupC.urgent.kind"), value: u.serviceKind ? t(`admSupC.urgent.kinds.${u.serviceKind}`) : "" },
        r.status(u.status),
        { label: t("admSupC.urgent.lawyer"), value: u.lawyerName },
        { label: t("adm.amount"), value: !phase && u.amount > 0 ? sum(u.amount, u.currency) : "" },
        r.tg(u.telegramSent),
      ]}
    >
      <PayState phase={phase} amount={u.gate?.amount || u.amount} currency={u.gate?.currency || u.currency} />
    </ResultCard>
  );
}
