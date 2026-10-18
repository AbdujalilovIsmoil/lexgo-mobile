import { useState } from "react";
import { isLostKey, stageOf, useMoveLead, type Column, type Lead } from "@/entities/admin-leads";

export type LostAsk = { lead: Lead; key: string; position?: number };

// Moving leads between stages: arrows, "move to…" and the drawer all end up in `go`.
// Entering a "lost" column first asks for a reason (the sheet opens once whatever
// sheet triggered the move has finished closing).
export function useMoveFlow(cols: Column[]) {
  const move = useMoveLead();
  const [ask, setAsk] = useState<LostAsk | null>(null);
  // `position` = where in the target column the card lands (default: the top, like the web's "move to…").
  const go = (lead: Lead, key: string, position?: number) => {
    if (stageOf(cols, lead.id) === key) return;
    if (isLostKey(key)) setTimeout(() => setAsk({ lead, key, position }), 340);
    else move.mutate({ lead, columnKey: key, position });
  };
  const shift = (lead: Lead, dir: -1 | 1) => {
    const next = cols[cols.findIndex((c) => c.key === stageOf(cols, lead.id)) + dir];
    if (next) go(lead, next.key, next.leads.length); // the arrows append at the end of the next column, like the web
  };
  const confirmLost = (reason: string, note: string) => {
    if (ask) move.mutate({ lead: ask.lead, columnKey: ask.key, position: ask.position, lost: { reason, note } });
    setAsk(null);
  };
  return { go, shift, ask, confirmLost, cancel: () => setAsk(null), busyId: move.isPending ? move.variables?.lead.id : undefined };
}
