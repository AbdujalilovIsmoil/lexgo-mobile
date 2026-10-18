import type { Command } from "@/entities/instructor";
import { usePathStore } from "@/shared/instructor";
import type { RunCtx } from "./context";

export const SUPPORT_ACTION = "start_support_ticket";
const BUILTIN = [SUPPORT_ACTION, "prepare_subscription_purchase", "start_document_request", "prepare_marketplace_purchase", "prepare_urgent_advokat_request"];
const CONFIRM_TYPES = ["preview_action", "confirm_required", "support_handoff"];

export const actionOf = (c: Command): string => (c.type === "support_handoff" ? SUPPORT_ACTION : c.action);
export const isMutating = (c: Command, extra: string[]): boolean => CONFIRM_TYPES.includes(c.type) || (!!c.action && [...BUILTIN, ...extra].includes(c.action));

// Support categories the backend knows; picked from the screen and the words of the question (same rules as the web).
export function supportCategory(path: string, message: string): string {
  const p = path.toLowerCase();
  const m = message.toLowerCase();
  if (/to.?lov|payme|click|karta|pul|оплат|payment/.test(m) || p.startsWith("/payments")) return "payment";
  if (p.startsWith("/subscription") || /tarif|obuna|paket|тариф|подписк|plan/.test(m)) return "subscription";
  if (p.startsWith("/lawyers") || /advokat|yurist|адвокат|юрист|lawyer/.test(m)) return "marketplace";
  if (p.startsWith("/services") || p.startsWith("/documents") || /hujjat|ariza|shartnoma|документ|document/.test(m)) return "documents";
  if (p.startsWith("/urgent") || /tezkor|срочн|urgent/.test(m)) return "urgent_advokat";
  return /parol|login|kirish|hisob|аккаунт|account/.test(m) ? "account" : "general";
}

// The request body the backend previews and later confirms. A ticket also carries the short assistant
// conversation (the user is told so in the dialog) and where the user was.
export function buildPayload(c: Command, ctx: RunCtx): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...c.payload };
  const slug = /^pricing\.plan\.([^.]+)$/.exec(c.target)?.[1];
  if (c.action === "prepare_subscription_purchase" && !payload.plan_slug && slug) payload.plan_slug = slug;
  if (actionOf(c) !== SUPPORT_ACTION) return payload;
  const path = usePathStore.getState().pathname;
  payload.message = typeof payload.message === "string" && payload.message.trim() ? payload.message : ctx.message;
  payload.category = typeof payload.category === "string" && payload.category ? payload.category : supportCategory(path, String(payload.message));
  payload.context = { current_path: path, ai_history: ctx.history.slice(-10), ai_session_id: ctx.sessionId };
  return payload;
}
