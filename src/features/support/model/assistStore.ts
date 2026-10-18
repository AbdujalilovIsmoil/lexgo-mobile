import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { AssistInfo, AssistPay, AssistKind } from "@/entities/support";

type State = {
  cards: AssistInfo[];
  openKey: string | null;
  show: (card: AssistInfo) => void;
  settle: (kind: AssistKind, pay: AssistPay, ids: string[]) => AssistInfo | null;
  open: (key: string) => void;
  close: () => void;
};

const MAX_CARDS = 20;
const near = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) < 3000;
const fill = (old: AssistInfo, next: AssistInfo): AssistInfo => ({ ...old, ...next, ticketWorkId: next.ticketWorkId || old.ticketWorkId, targetId: next.targetId || old.targetId, paymentId: next.paymentId || old.paymentId });

// What operators prepared for me this session (shown in a global sheet and in the ticket's timeline).
// The socket delivers each assist event twice; frames of the same action are merged into one card.
export const useAssistStore = create<State>((set, get) => ({
  cards: [],
  openKey: null,
  show: (card) => {
    const cards = get().cards;
    const frame = cards.find((c) => c.kind === card.kind && c.ticketId === card.ticketId && near(c.at, card.at));
    if (frame) return set({ cards: cards.map((c) => (c === frame ? fill(frame, { ...card, key: frame.key, at: frame.at }) : c)) });
    const same = cards.find((c) => c.key === card.key); // a newer preview of the same thing replaces the old one
    set({ cards: same ? cards.map((c) => (c === same ? fill(same, card) : c)) : [...cards, card].slice(-MAX_CARDS), openKey: card.key });
  },
  settle: (kind, pay, ids) => {
    const open = get().cards.filter((c) => c.kind === kind && c.pay === "pending");
    const hit = (ids.length ? open.find((c) => ids.some((id) => id === c.targetId || id === c.paymentId)) : undefined) ?? (ids.length ? undefined : open[open.length - 1]);
    if (!hit) return null;
    set((s) => ({ cards: s.cards.map((c) => (c === hit ? { ...c, pay } : c)) }));
    return { ...hit, pay };
  },
  open: (key) => set({ openKey: key }),
  close: () => set({ openKey: null }),
}));

registerSessionReset(() => useAssistStore.setState({ cards: [], openKey: null }));
