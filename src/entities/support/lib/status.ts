import type { SupportTicket } from "../model/types";

const CLOSED = new Set(["closed", "resolved", "cancelled"]);
const GENERIC = new Set(["support so'rovi", "support so‘rovi", "ai instruktor orqali support", "support message", "support"]);

export const isClosed = (status: string) => CLOSED.has(status);
export const isWaiting = (status: string) => status === "waiting_operator" || status === "reopened";
export const isUrgent = (priority: string) => priority === "high" || priority === "urgent";

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Subject, or the first words of the request when the subject is a generic placeholder. */
export function ticketTitle(tk: Pick<SupportTicket, "title" | "description" | "lastMessage">, fallback: string): string {
  const title = tk.title.trim();
  if (title && !GENERIC.has(title.toLowerCase())) return title;
  const text = (tk.description || tk.lastMessage).replace(/\s+/g, " ").trim();
  return text ? clip(text, 70) : fallback;
}

/** First sentence of a message, used as the ticket subject (max 80 chars). */
export function subjectFrom(message: string): string {
  const text = message.replace(/\s+/g, " ").trim();
  return clip(text.split(/(?<=[.!?])\s/)[0] || text, 80);
}
