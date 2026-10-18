import type { HandoffTurn } from "@/entities/support";
import type { AiTurn } from "./aiStore";

const MAX_CHARS = 600;
// Phone numbers and card-like digit runs never leave the phone inside the AI context.
const SECRET = /\+?\d[\d\s\-()]{8,}\d/g;

const scrub = (s: string): string => {
  const v = s.replace(SECRET, "[…]").replace(/\s+/g, " ").trim();
  return v.length > MAX_CHARS ? `${v.slice(0, MAX_CHARS - 1).trimEnd()}…` : v;
};

/** Finished AI turns in the shape the backend stores with a ticket. */
export const handoffTurns = (turns: AiTurn[]): HandoffTurn[] =>
  turns.filter((t) => t.state === "done").map((t) => ({ q: scrub(t.q), a: scrub([t.a, ...t.steps].join(" ")), at: t.at }));
