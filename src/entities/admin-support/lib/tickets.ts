import type { SupportTab, SupportTicket } from "../model/types";
import { serverMs } from "./time";

export const CLOSED = new Set(["closed", "resolved", "cancelled"]);
const SUPERVISORS = new Set(["admin", "manager"]);
const GENERIC = new Set(["support so'rovi", "support so‘rovi", "ai instruktor orqali support", "support message", "support"]);

// Queue tab → server filter (status=active means "not closed").
export const TAB_QUERY: Record<SupportTab, { status: string; assignedToMe?: boolean }> = {
  new: { status: "waiting_operator" },
  mine: { status: "active", assignedToMe: true },
  transferred: { status: "transferred" },
  closed: { status: "closed" },
};

export const isClosed = (status: string) => CLOSED.has(status);
export const isWaiting = (status: string) => status === "waiting_operator" || status === "reopened";
export const isUrgent = (priority: string) => priority === "high" || priority === "urgent";
export const isSupervisor = (role: string | undefined) => SUPERVISORS.has((role ?? "").trim().toLowerCase());
export const oldestFirst = (a: SupportTicket, b: SupportTicket) => serverMs(a.createdAt) - serverMs(b.createdAt);

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// Subject, or the first words of the request when the subject is a generic placeholder.
export function ticketTitle(tk: Pick<SupportTicket, "title" | "description" | "lastMessage">, fallback: string): string {
  const title = tk.title.trim();
  if (title && !GENERIC.has(title.toLowerCase())) return title;
  const text = (tk.description || tk.lastMessage).replace(/\s+/g, " ").trim();
  return text ? clip(text, 70) : fallback;
}

// What the signed-in operator may do with a ticket (same rules as SupportQueue.tsx).
export function ticketAccess(tk: SupportTicket | null, meId: string, backendRole?: string) {
  const known = Boolean(tk?.status);
  const open = Boolean(tk && known && !isClosed(tk.status));
  const mine = Boolean(tk && meId && tk.operatorUserId === meId);
  return {
    known,
    open,
    mine,
    ownOpen: mine && open,
    claimable: Boolean(tk && open && !mine && (!tk.operatorUserId || isWaiting(tk.status))),
    watching: Boolean(tk && !mine && open && tk.operatorUserId && isSupervisor(backendRole)),
    isClient: Boolean(tk && meId && tk.clientUserId === meId),
  };
}
