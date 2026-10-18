import type { AssistContext, AssistSent, SupportTicket } from "@/entities/admin-support";
import type { AssistSheetKey } from "./AssistActions";
import { DocSheet } from "./DocSheet";
import { MarketSheet } from "./MarketSheet";
import { PlanSheet } from "./PlanSheet";
import { UrgentSheet } from "./UrgentSheet";

type Props = { sheet: AssistSheetKey | null; onClose: () => void; ticket: SupportTicket; ctx: AssistContext; onSent: (s: AssistSent) => void; onBlock: (e: unknown) => boolean };

// The four request forms; only the open one is visible, the others keep their draft state out of sight.
export function AssistSheets({ sheet, onClose, ticket, ctx, onSent, onBlock }: Props) {
  const base = { ticketId: ticket.id, client: ctx.client, clientName: ticket.clientName, ctx, onClose, onSent, onBlock };
  return (
    <>
      <PlanSheet {...base} visible={sheet === "plan"} />
      <DocSheet {...base} visible={sheet === "doc"} />
      <MarketSheet {...base} visible={sheet === "market"} />
      <UrgentSheet {...base} visible={sheet === "urgent"} />
    </>
  );
}
