import { BottomSheet, SheetScroll, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { serverIso, SupportStatusPill, ticketTitle, useSupportLabels, type SupportTicket } from "@/entities/support";

type Props = { ticket: SupportTicket | null; visible: boolean; onClose: () => void };

// Facts of a ticket: public id (SPT-…), status, topic, who handles it, dates and the resolution.
export function TicketDetailsSheet({ ticket, visible, onClose }: Props) {
  const { t, locale } = useT();
  const labels = useSupportLabels();
  const tk = useKept(ticket);
  const date = (iso: string) => (iso ? fmtDateTime(serverIso(iso), locale) : "");
  return (
    <BottomSheet visible={visible} onClose={onClose} title={tk ? ticketTitle(tk, t("sp1.untitled")) : ""} subtitle={tk?.workId} snaps={[0.6, 0.9]}>
      <SheetScroll>
        {tk ? (
          <>
            <FactRows
              rows={[
                { label: t("sp3.d.id"), value: tk.workId },
                { label: t("sp3.d.status"), value: <SupportStatusPill status={tk.status} /> },
                { label: t("sp3.d.topic"), value: labels.category(tk.category) },
                { label: t("sp3.d.priority"), value: labels.priority(tk.priority) },
                { label: t("sp3.d.operator"), value: tk.operatorName },
                { label: t("sp3.d.created"), value: date(tk.createdAt) },
                { label: t("sp3.d.closed"), value: date(tk.closedAt) },
              ]}
            />
            {tk.description ? <Text variant="small" tone="gray">{tk.description}</Text> : null}
            {tk.resolution ? <FactRows rows={[{ label: t("sp3.resolution"), value: tk.resolution }]} /> : null}
            {tk.reopenReason ? <FactRows rows={[{ label: t("sp3.d.reopenReason"), value: tk.reopenReason }]} /> : null}
          </>
        ) : null}
      </SheetScroll>
    </BottomSheet>
  );
}
