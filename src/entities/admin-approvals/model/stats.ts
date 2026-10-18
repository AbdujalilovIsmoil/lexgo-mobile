import type { Approval } from "./types";

export const TINT = { ok: "#22C55E", warn: "#F59E0B", err: "#EF4444", blue: "#3B82F6" };
const CLOSED = new Set(["rejected", "cancelled"]);

export const isShut = (a: Approval) => CLOSED.has(a.status);
export const isSigned = (a: Approval) => !isShut(a) && a.adminApproved && a.managerApproved;

// Colour of the ticket strip: closed = red, both signed = green, one signed = blue, none = amber.
export const approvalTint = (a: Approval) => (isShut(a) ? TINT.err : isSigned(a) ? TINT.ok : a.adminApproved || a.managerApproved ? TINT.blue : TINT.warn);

// Numbers of the hero card: who still has to sign and how the queue splits.
export function approvalStats(list: Approval[]) {
  const open = list.filter((a) => !isShut(a));
  return {
    total: list.length,
    waitAdmin: open.filter((a) => !a.adminApproved).length,
    waitManager: open.filter((a) => !a.managerApproved).length,
    signed: list.filter(isSigned).length,
    one: open.filter((a) => a.adminApproved !== a.managerApproved).length,
    none: open.filter((a) => !a.adminApproved && !a.managerApproved).length,
    shut: list.length - open.length,
  };
}
