import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { CmdStatus } from "./actionTypes";

export type CmdState = { status: CmdStatus; reason: string };
const FINAL = new Set<CmdStatus>(["done", "missing", "failed", "cancelled", "skipped"]);

type StatusState = { map: Record<string, CmdState>; set: (id: string, status: CmdStatus, reason?: string) => void; clear: () => void };

// Per-command progress (running → done / missing / failed / cancelled / skipped). A final state sticks,
// which also makes a command idempotent: it is never executed twice.
export const useCmdStatus = create<StatusState>((set) => ({
  map: {},
  set: (id, status, reason = "") =>
    set((s) => {
      const cur = s.map[id];
      if (cur && FINAL.has(cur.status)) return s;
      return { map: { ...s.map, [id]: { status, reason } } };
    }),
  clear: () => set({ map: {} }),
}));

export const isFinal = (id: string): boolean => {
  const cur = useCmdStatus.getState().map[id];
  return !!cur && FINAL.has(cur.status);
};

registerSessionReset(() => useCmdStatus.getState().clear());
