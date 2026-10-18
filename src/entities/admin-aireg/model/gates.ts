import { create } from "zustand";
import { ApiError } from "@/shared/api";
import type { Gate, Loaded } from "./types";

const TTL = 10 * 60 * 1000;
type State = { missing: Partial<Record<Gate, boolean>>; mark: (g: Gate) => void; clear: (g?: Gate) => void };

// The AI-reglament routes are rolled out one by one. A route that answers "does not exist" is
// remembered for 10 minutes (so the screen says "not enabled yet" instead of failing again and
// again); "check again" clears it.
export const useGates = create<State>((set, get) => ({
  missing: {},
  mark: (g) => {
    set((s) => ({ missing: { ...s.missing, [g]: true } }));
    setTimeout(() => get().clear(g), TTL);
  },
  clear: (g) => set((s) => ({ missing: g ? { ...s.missing, [g]: false } : {} })),
}));

export const useGate = (g: Gate) => useGates((s) => !!s.missing[g]);
const gateMissing = (g: Gate) => !!useGates.getState().missing[g];

// 405 / 501, or a 404 with no message of its own (a real "reglament not found" carries a message).
export const isRouteMissing = (e: unknown) => e instanceof ApiError && (e.status === 405 || e.status === 501 || (e.status === 404 && (!e.detail || e.detail === "Not Found")));

export async function gated<T>(gate: Gate, run: () => Promise<T>): Promise<Loaded<T>> {
  if (gateMissing(gate)) return { kind: "missing" };
  try {
    const data = await run();
    useGates.getState().clear(gate);
    return { kind: "ok", data };
  } catch (e) {
    if (!isRouteMissing(e)) throw e;
    useGates.getState().mark(gate);
    return { kind: "missing" };
  }
}
