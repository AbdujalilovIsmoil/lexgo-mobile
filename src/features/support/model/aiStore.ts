import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { AiAnswer, AiTarget } from "@/entities/support";

export type AiTurn = { id: number; q: string; a: string; steps: string[]; target: AiTarget | null; handoff: boolean; at: string; state: "pending" | "done" | "failed" };
type State = {
  turns: AiTurn[];
  sessionId: string;
  add: (q: string) => number;
  done: (id: number, a: AiAnswer) => void;
  fail: (id: number) => void;
  pend: (id: number) => void;
  clear: () => void;
};

let seq = 0;
const MAX_TURNS = 10;

// The user's questions to the support AI. Kept only in memory (cleared on logout): the last turns
// travel with a new ticket so the operator sees what was already tried (TZ 10).
export const useAiStore = create<State>((set) => ({
  turns: [],
  sessionId: "",
  add: (q) => {
    const id = ++seq;
    set((s) => ({ turns: [...s.turns, { id, q, a: "", steps: [], target: null, handoff: true, at: new Date().toISOString(), state: "pending" as const }].slice(-MAX_TURNS) }));
    return id;
  },
  done: (id, r) => set((s) => ({ sessionId: r.sessionId || s.sessionId, turns: s.turns.map((t) => (t.id === id ? { ...t, a: r.answer, steps: r.steps, target: r.target, handoff: r.handoff, state: "done" as const } : t)) })),
  fail: (id) => set((s) => ({ turns: s.turns.map((t) => (t.id === id ? { ...t, state: "failed" as const } : t)) })),
  pend: (id) => set((s) => ({ turns: s.turns.map((t) => (t.id === id ? { ...t, state: "pending" as const } : t)) })),
  clear: () => set({ turns: [], sessionId: "" }),
}));

registerSessionReset(() => useAiStore.getState().clear());
