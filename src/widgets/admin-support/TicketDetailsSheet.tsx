import { SupportStatusPill, serverIso, useSupportLabels, type SupportTicket } from "@/entities/admin-support";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// Everything the API knows about the ticket.
export function TicketDetailsSheet({ ticket: current, visible, onClose }: { ticket: SupportTicket | null; visible: boolean; onClose: () => void }) {
  const { t, locale } = useT();
  const labels = useSupportLabels();
  const tk = useKept(current);
  const when = (iso: string) => (iso ? fmtDateTime(serverIso(iso), locale) : "");
  return (
    <FormSheet visible={visible} onClose={onClose} title={tk?.workId || t("admSup.details")} subtitle={tk?.title}>
      {tk ? (
        <FactRows
          rows={[
            { label: t("adm.status"), value: <SupportStatusPill status={tk.status} /> },
            { label: t("admSup.client"), value: tk.clientName },
            { label: "LexGo ID", value: tk.clientLexgoId },
            { label: t("admSup.priority"), value: labels.priority(tk.priority) },
            { label: t("admSup.topic"), value: labels.category(tk.category) },
            { label: t("admSup.operator"), value: tk.operatorName },
            { label: t("adm.created"), value: when(tk.createdAt) },
            { label: t("admSup.closedLbl"), value: when(tk.closedAt) },
            { label: t("admSup.resolution"), value: tk.resolution },
            { label: t("admSup.transferReasonLbl"), value: tk.transferReason },
            { label: t("admSup.reopenReasonLbl"), value: tk.reopenReason },
          ]}
        />
      ) : null}
    </FormSheet>
  );
}
