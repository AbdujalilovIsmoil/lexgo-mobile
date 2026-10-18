import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { AcceptResult, RuleScope, RulesState, ServiceRule } from "../model/types";

const str = (v: unknown): string => asStr(v).trim();

const scopeOf = (v: string): RuleScope => {
  const s = v.toLowerCase();
  return s === "global" || s === "service" || s === "category" ? s : "";
};

// One rule row (web normaliseServiceRule): id/rule_id, key, title/name, version, body/content/text, scope + scope_id.
export function normRule(raw: unknown): ServiceRule {
  const r = asDict(raw);
  const acceptedAt = str(r.accepted_at);
  return {
    id: str(r.id ?? r.rule_id),
    key: str(r.rule_key ?? r.key),
    title: str(r.title ?? r.name),
    version: str(r.version ?? r.rule_version),
    body: asStr(r.body ?? r.content ?? r.text ?? r.description),
    scope: scopeOf(str(r.scope_type ?? r.scope)),
    scopeId: str(r.scope_id),
    effectiveAt: str(r.effective_at ?? r.effective_from),
    accepted: typeof r.accepted === "boolean" ? r.accepted : !!acceptedAt,
    acceptedAt,
  };
}

// GET /marketplace/service-rules → { items|rules, all_accepted, count }; a bare array works too.
export function normRules(raw: unknown): RulesState {
  const d = asDict(raw);
  const list = Array.isArray(raw) ? raw : Array.isArray(d.items) ? d.items : asArr(d.rules);
  const items = list.map(normRule).filter((r) => r.id || r.title);
  return {
    items,
    allAccepted: typeof d.all_accepted === "boolean" ? d.all_accepted : items.every((r) => r.accepted),
    count: asNum(d.count, items.length),
  };
}

// POST …/{id}/accept → { rule_id, accepted, accepted_at, all_accepted, rule?, acceptance? }.
export function normAccept(raw: unknown, ruleId: string): AcceptResult {
  const r = asDict(raw);
  const rule = asDict(r.rule);
  const parsed = Object.keys(rule).length ? normRule(rule) : null;
  return {
    ruleId: str(r.rule_id ?? asDict(r.acceptance).rule_id) || parsed?.id || ruleId,
    accepted: typeof r.accepted === "boolean" ? r.accepted : !parsed || parsed.accepted,
    acceptedAt: str(r.accepted_at ?? asDict(r.acceptance).accepted_at ?? parsed?.acceptedAt),
    allAccepted: typeof r.all_accepted === "boolean" ? r.all_accepted : null,
  };
}

export const pendingCount = (s: RulesState | undefined): number => (s ? s.items.filter((r) => !r.accepted).length : 0);

// True when the ISO date lies ahead of `now` ("takes effect on" vs "in force since").
export const isFuture = (iso: string, now: number = Date.now()): boolean => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) && t > now;
};
