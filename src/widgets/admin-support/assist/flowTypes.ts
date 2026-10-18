import type { AssistClient, AssistContext, AssistSent } from "@/entities/admin-support";

// What every assist form needs from the assist screen.
export type FlowProps = {
  ticketId: string;
  client: AssistClient | null;
  clientName: string;
  ctx: AssistContext;
  visible: boolean;
  onClose: () => void;
  onSent: (s: AssistSent) => void;
  onBlock: (e: unknown) => boolean; // true when the ticket got locked (closed / reassigned): the screen shows why
};
