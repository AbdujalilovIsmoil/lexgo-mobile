import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { Command } from "../model/types";

const pick = (...vals: unknown[]): string => {
  for (const v of vals) {
    const s = typeof v === "string" ? v.trim() : typeof v === "number" && Number.isFinite(v) ? String(v) : "";
    if (s) return s;
  }
  return "";
};

function fieldsOf(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (k: string, val: unknown) => {
    const s = typeof val === "string" ? val : typeof val === "number" ? String(val) : null;
    if (k.trim() && s !== null && !(k in out)) out[k.trim()] = s;
  };
  if (Array.isArray(v)) for (const it of v) put(pick(asDict(it).ai_id, asDict(it).target, asDict(it).field, asDict(it).name), asDict(it).value);
  else for (const [k, val] of Object.entries(asDict(v))) put(k, val);
  return out;
}

function stepsOf(v: unknown): string[] {
  return asArr(v)
    .map((x) => (typeof x === "string" ? x.trim() : pick(asDict(x).text, asDict(x).title, asDict(x).caption, asDict(x).label)))
    .filter(Boolean)
    .slice(0, 8);
}

// A command from `commands[]` (with an id) or `actions[]` (without one: the caller supplies a batch prefix).
export function normCommand(v: unknown, index: number, batch: string): Command | null {
  const d = asDict(v);
  const type = pick(d.type, d.command_type, d.command, d.kind).toLowerCase();
  if (!type) return null;
  return {
    id: pick(d.id, d.command_id) || `${batch}:${index}`,
    type,
    href: pick(d.href, d.route, d.path),
    target: pick(d.target, d.target_id, d.ai_id),
    modal: pick(d.modal, d.modal_id),
    text: pick(d.text, d.message, d.caption, d.tooltip, d.label),
    style: pick(d.style).toLowerCase(),
    durationMs: asNum(d.duration_ms ?? d.duration),
    fields: fieldsOf(d.fields ?? d.values ?? d.form),
    action: pick(d.action, d.action_type),
    payload: asDict(d.payload ?? d.params),
    steps: stepsOf(d.steps ?? d.items),
  };
}

export function normCommands(list: unknown, batch: string): Command[] {
  const seen = new Set<string>();
  const out: Command[] = [];
  asArr(list).forEach((raw, i) => {
    const c = normCommand(raw, i, batch);
    if (!c) return;
    if (seen.has(c.id)) c.id = `${c.id}:${i}`;
    seen.add(c.id);
    out.push(c);
  });
  return out.slice(0, 20);
}

export { pick, stepsOf };
export const textOf = (v: unknown): string => asStr(v).trim();
