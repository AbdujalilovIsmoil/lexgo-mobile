import { useState } from "react";
import { Skeleton } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { TicketRow, useLatestActive } from "@/entities/support";
import { NewTicketFields, useNewTicket } from "@/features/support";

type Props = { visible: boolean; onClose: () => void; initial: { message: string; topic: string; force: boolean }; onOpenTicket: (id: string) => void };

// Web "supnew" window: a new chat with the operator, or - when one is ongoing - the offer to continue it first.
export function NewChatSheet({ visible, onClose, initial, onOpenTicket }: Props) {
  const { t } = useT();
  const latest = useLatestActive(visible);
  const [forced, setForced] = useState(false);
  const f = useNewTicket({ message: "", topic: "" }, (id) => { onClose(); onOpenTicket(id); });
  useSheetReset(visible, () => { f.reset(initial); setForced(initial.force); });
  const head = latest.data && !forced ? latest.data : null;
  const go = (id: string) => { onClose(); onOpenTicket(id); };
  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      title={head ? t("sp2.resumeTitle") : t("sp2.composeTitle")}
      subtitle={head ? t("sp2.resumeText") : t("sp2.composeLead")}
      onSubmit={head ? () => go(head.id) : () => void f.submit()}
      submitLabel={head ? t("sp2.resume") : t("sp2.submit")}
      submitting={f.pending}
      disabled={latest.isLoading}
      secondary={{ label: head ? t("sp2.newAnyway") : t("sp2.cancel"), onPress: head ? () => setForced(true) : onClose }}
      snaps={head || latest.isLoading ? [0.42, 0.9] : [0.82, 0.94]}
    >
      {latest.isLoading ? <Skeleton height={90} round={20} /> : head ? <TicketRow item={head} onPress={() => go(head.id)} /> : <NewTicketFields f={f} />}
    </FormSheet>
  );
}
