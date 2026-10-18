import type { Dict } from "@/shared/lib/json";
import type { AiHistory, AiTurn } from "../model/assistTypes";
import { dictOf, filled, firstText, listOf } from "./dict";

const MAX_TEXT = 600;
const MAX_TURNS = 10;
const USER = new Set(["user", "client", "human", "customer", "mijoz"]);
const BOT = new Set(["assistant", "ai", "bot", "model", "ai_instructor", "instructor"]);
const clip = (s: string) => (s.length > MAX_TEXT ? `${s.slice(0, MAX_TEXT - 1).trimEnd()}…` : s);

function turnsOf(list: unknown[]): AiTurn[] {
  const out: AiTurn[] = [];
  for (const raw of list) {
    const x = dictOf(raw);
    if (!filled(x)) continue;
    const at = firstText(x.at, x.created_at, x.timestamp, x.time);
    const q = firstText(x.q, x.question, x.prompt);
    const a = firstText(x.a, x.answer, x.response, x.reply);
    if (q || a) {
      out.push({ q: clip(q), a: clip(a), at });
      continue;
    }
    const role = firstText(x.role, x.sender, x.author, x.from).toLowerCase();
    const body = clip(firstText(x.content, x.text, x.message, x.body));
    const last = out[out.length - 1];
    if (!body) continue;
    if (BOT.has(role)) {
      if (last && !last.a) out[out.length - 1] = { ...last, a: body, at: last.at || at };
      else out.push({ q: "", a: body, at });
    } else if (!role || USER.has(role)) out.push({ q: body, a: "", at });
  }
  return out.slice(-MAX_TURNS);
}

// The client's earlier chat with the AI instructor, wherever the backend put it.
export function aiHistoryOf(d: Dict): AiHistory {
  const tk = dictOf(d.ticket);
  const tp = dictOf(tk.payload);
  const scopes = [tk.context, tp.context, tk.ai_context, tp.ai_context, d.context, d.ai_context].map(dictOf).filter(filled);
  const holders = [...scopes, tp, tk, d];
  let turns: AiTurn[] = [];
  for (const h of holders) {
    const scoped = scopes.includes(h);
    for (const list of [h.ai_history, h.ai_messages, scoped ? h.history : undefined, scoped ? h.messages : undefined]) {
      const items = listOf(list);
      if (items.length) turns = turnsOf(items);
      if (turns.length) break;
    }
    if (turns.length) break;
  }
  return { turns, sessionId: firstText(...holders.map((h) => h.ai_session_id), ...scopes.map((s) => s.session_id)) };
}
