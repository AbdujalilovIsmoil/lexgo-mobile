import { serverMs, type AssistInfo, type SupportCall, type SupportMessage } from "@/entities/support";

export type ChatRow =
  | { k: "m"; id: string; at: string; m: SupportMessage }
  | { k: "a"; id: string; at: string; card: AssistInfo }
  | { k: "c"; id: string; at: string; call: SupportCall };

const ms = (r: ChatRow) => (r.k === "a" ? Date.parse(r.at) || 0 : serverMs(r.at));

/** Messages, assist notes and a ringing call in one newest-first timeline (the list is inverted). */
export function chatRows(messages: SupportMessage[], cards: AssistInfo[], call: SupportCall | null): ChatRow[] {
  const rows: ChatRow[] = [
    ...messages.map((m): ChatRow => ({ k: "m", id: m.id || m.createdAt, at: m.createdAt, m })),
    ...cards.map((card): ChatRow => ({ k: "a", id: `a-${card.key}`, at: card.at, card })),
  ].sort((a, b) => ms(b) - ms(a));
  return call ? [{ k: "c", id: `c-${call.callId}`, at: "", call }, ...rows] : rows;
}
