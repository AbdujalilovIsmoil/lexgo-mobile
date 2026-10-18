import type { Gap } from "../model/types";
import { amount, isDict, personOf, pick, strings, text, when } from "./norm";

export function normGap(raw: unknown, i: number): Gap | null {
  if (typeof raw === "string") {
    const question = raw.trim();
    return question ? { key: `gap-${i}`, id: "", question, count: 1, lastAskedAt: "", sessionId: "", userName: "", userPhone: "", role: "", status: "open", category: "", reason: "", missing: [] } : null;
  }
  if (!isDict(raw)) return null;
  const question = text(raw.question, raw.message, raw.text, raw.query, raw.prompt, raw.user_message, raw.content, raw.title);
  if (!question) return null;
  const user = raw.user ?? raw.client ?? raw.asked_by ?? raw.requester ?? raw.actor;
  const session = isDict(raw.session) ? raw.session : {};
  const fallback = isDict(raw.support_fallback) ? raw.support_fallback : {};
  const id = pick(raw.id, raw.gap_id, raw.uuid);
  return {
    key: id || `gap-${i}`, id, question,
    count: Math.max(1, amount(raw.count, raw.times, raw.asked_count, raw.ask_count, raw.occurrences, raw.hits, raw.frequency)),
    lastAskedAt: when(raw.last_asked_at, raw.last_seen_at, raw.last_at, raw.asked_at, raw.updated_at, raw.created_at),
    sessionId: pick(raw.session_id, raw.ai_session_id, raw.chat_session_id, raw.conversation_id, session.id),
    userName: personOf(user) || pick(raw.user_name, raw.client_name, raw.full_name),
    userPhone: pick(isDict(user) ? user.phone : "", raw.user_phone, raw.phone),
    role: pick(raw.role, raw.user_role, raw.actor_role, isDict(user) ? user.role : "").toLowerCase(),
    status: pick(raw.status, raw.state).toLowerCase() || "open",
    category: pick(raw.category, raw.intent, raw.topic).toLowerCase(),
    reason: pick(raw.reason, fallback.reason, raw.note),
    missing: strings(raw.missing_requirements ?? raw.missing),
  };
}

export const isOpenGap = (g: Gap) => !g.status || ["open", "new", "pending"].includes(g.status);
