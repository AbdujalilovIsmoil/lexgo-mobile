import { http } from "@/shared/api";
import { asDict, asNum, listFrom } from "@/shared/lib/json";
import type { Page } from "@/shared/lib/usePaged";
import type { NewTicketInput, SupportTicket, TicketTab } from "../model/types";
import { subjectFrom } from "../lib/status";
import { normTicket } from "./normTicket";

const enc = encodeURIComponent;

// GET /support/tickets/me?status=active|closed — the server filters and pages.
export async function listMyTickets(tab: TicketTab, p: { limit: number; offset: number }): Promise<Page<SupportTicket>> {
  const raw = await http(`/support/tickets/me?${new URLSearchParams({ status: tab, limit: String(p.limit), offset: String(p.offset) })}`);
  const items = listFrom(raw, "items", "data", "tickets").map(normTicket);
  const seen = p.offset + items.length;
  const total = Math.max(asNum(asDict(raw).total, seen), seen);
  const more = asDict(raw).has_more;
  return { items, total, hasMore: (typeof more === "boolean" ? more : seen < total) && items.length > 0 };
}

export const getTicket = async (id: string): Promise<SupportTicket> => normTicket(await http(`/support/tickets/${enc(id)}`));

// POST /support/tickets. The AI turns go in `context` under the keys the backend stores
// (question / answer / created_at); q / a / at are sent too for older deployments.
export async function createTicket(i: NewTicketInput): Promise<SupportTicket> {
  const message = i.message.trim();
  const turns = i.turns.map((x) => ({ question: x.q, answer: x.a, created_at: x.at, q: x.q, a: x.a, at: x.at }));
  const context = { current_path: i.path ?? "/support", role: i.role, topic_picked: i.topicPicked, ai_history: turns, ...(i.aiSessionId ? { ai_session_id: i.aiSessionId } : {}) };
  const body = { subject: subjectFrom(message), message, description: message, category: i.category, priority: i.urgent ? "high" : "normal", source: "mobile", context };
  return normTicket(await http("/support/tickets", { method: "POST", body }));
}

// Only the ticket's own client may reopen (the backend answers 403 to others).
export async function reopenTicket(id: string, reason: string): Promise<SupportTicket> {
  return normTicket(await http(`/support/tickets/${enc(id)}/reopen`, { method: "POST", body: { reason: reason.trim() } }));
}
