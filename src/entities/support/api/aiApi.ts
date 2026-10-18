import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { appTargetOf, type AiTarget } from "../lib/aiRoute";

export type AiAnswer = { answer: string; steps: string[]; sessionId: string; target: AiTarget | null; handoff: boolean };
export type AiAskInput = { message: string; locale: string; role: string; sessionId: string; history: { role: "user" | "assistant"; content: string }[] };

const ROUTE = "/mobile/client/support";

const textOf = (v: unknown): string => (typeof v === "string" ? v : asStr(asDict(v).text ?? asDict(v).title ?? asDict(v).label ?? asDict(v).step ?? asDict(v).description)).replace(/\s+/g, " ").trim();

function targetOf(d: Record<string, unknown>): AiTarget | null {
  for (const a of asArr(d.actions)) {
    const x = asDict(a);
    if (x.type === "navigate") return appTargetOf(asStr(x.href ?? x.route ?? x.path));
  }
  return appTargetOf(asStr(asDict(d.route).href));
}

// POST /ai/instructor/chat — the platform instructor (TZ 9). It guides, it never executes anything:
// we only read the answer text, the steps and the screen it points to.
export async function askSupportAi(i: AiAskInput): Promise<AiAnswer> {
  const state = { current_route: ROUTE, visible_ai_ids: [], selected_items: {}, form_state: {}, viewport: { width: 390, height: 844 }, open_modal: "" };
  const body = { locale: i.locale, message: i.message, history: i.history, runtime_state: state, ui_manifest: { route: ROUTE, role: i.role, page_title: "Support", elements: [] }, ...(i.sessionId ? { session_id: i.sessionId } : {}) };
  const d = asDict(await http("/ai/instructor/chat", { method: "POST", body }));
  return {
    answer: asStr(d.answer ?? d.reply).trim(),
    steps: asArr(d.steps).map(textOf).filter(Boolean).slice(0, 8),
    sessionId: asStr(d.session_id),
    target: targetOf(d),
    handoff: asDict(d.support_fallback).available !== false,
  };
}
