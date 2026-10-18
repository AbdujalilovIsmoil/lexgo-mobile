import { asArr, asDict } from "@/shared/lib/json";
import type { ChatReply, SupportOffer } from "../model/types";
import { normCommands, pick, stepsOf } from "./normCommand";

function support(v: unknown): SupportOffer {
  if (typeof v === "boolean") return { available: v, reason: "", action: "start_support_ticket" };
  const d = asDict(v);
  return { available: Object.keys(d).length > 0 && d.available !== false, reason: pick(d.reason), action: pick(d.confirm_action) || "start_support_ticket" };
}

const lines = (v: unknown, max: number): string[] => stepsOf(asArr(v)).slice(0, max);

// POST /ai/instructor/chat (also the payload of an `ai_instructor.response` socket event).
export function normReply(raw: unknown, sentSession = ""): ChatReply {
  const d = asDict(raw);
  const fb = d.support_fallback ?? d.supportFallback;
  const need = asArr(d.missing_requirements).length ? d.missing_requirements : asDict(fb).missing_requirements;
  const batch = pick(d.response_id, d.id) || `r${Date.now().toString(36)}`;
  const cmds = normCommands(asArr(d.commands).length ? d.commands : d.actions, batch);
  return {
    sessionId: pick(d.session_id, asDict(d.session).id, sentSession),
    responseId: pick(d.response_id, d.message_id, d.id, d.request_id),
    answer: pick(d.answer, d.reply, d.text),
    intent: pick(d.intent) || "general_help",
    commands: cmds,
    steps: lines(d.steps, 8),
    suggestions: lines(d.suggestions, 3),
    missing: lines(need, 6),
    support: support(fb),
  };
}
