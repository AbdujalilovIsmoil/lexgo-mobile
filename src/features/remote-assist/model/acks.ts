import type { RaAck } from "@/entities/remote-assist/model/types";

type Transport = { socket: (commandId: string, a: RaAck) => boolean; http: (commandId: string, a: RaAck) => Promise<unknown> };

// Every command gets exactly one final answer (TZ RA §11): executed, rejected, confirmed or cancelled — for a confirmation preceded by
// one confirmation_required. Over the socket first, over HTTP when it is not open. Only ids and statuses are kept, never a payload (§20.11).
export function createAcks(t: Transport) {
  const final = new Map<string, RaAck>();
  const asked = new Set<string>();
  const deliver = async (id: string, a: RaAck) => {
    if (!t.socket(id, a)) await t.http(id, a);
  };
  return {
    answered: (id: string): boolean => final.has(id),
    /** False when this answer was already given (a second final answer, a repeated confirmation_required): nothing is sent. */
    async send(id: string, a: RaAck): Promise<boolean> {
      if (!id || final.has(id)) return false;
      if (a.status === "confirmation_required") {
        if (asked.has(id)) return false;
        asked.add(id);
      } else final.set(id, a);
      await deliver(id, a);
      return true;
    },
    /** The history still shows an answered command open after a reconnect: the answer never arrived, so it goes again over HTTP — the command is not run again. */
    async resend(id: string): Promise<void> {
      const a = final.get(id);
      if (a) await t.http(id, a);
    },
  };
}

export type Acks = ReturnType<typeof createAcks>;
