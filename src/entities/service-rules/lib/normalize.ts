import { ApiError } from "@/shared/api";
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

// Client and seller rules are never mixed (TZ.md §20): a rule addressed to the client is not the seller's to accept.
export const forSeller = (raw: unknown): boolean => !/^(client|customer|buyer)$/.test(str(asDict(raw).audience ?? asDict(raw).rule_audience).toLowerCase());

// GET /marketplace/service-rules → { items|rules, all_accepted, count }; a bare array works too.
export function normRules(raw: unknown): RulesState {
  const d = asDict(raw);
  const list = Array.isArray(raw) ? raw : Array.isArray(d.items) ? d.items : asArr(d.rules);
  const items = list.filter(forSeller).map(normRule).filter((r) => r.id || r.title);
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

// Rule ids from a list of ids or of rule objects ({id} / {rule_id}), trimmed and without repeats.
export const ruleIds = (v: unknown): string[] =>
  [...new Set(asArr(v).map((x) => (typeof x === "string" || typeof x === "number" ? String(x).trim() : str(asDict(x).id ?? asDict(x).rule_id))).filter(Boolean))];

const RULES_CODE = "service_rules_acceptance_required";

// A refusal because rules are not accepted yet (TZ.md §5.3, §18) → the ids it names ([] when it names none); null for any other
// failure. The code sits in detail.code (branch on it, never on the text), or is the bare detail string.
export function rulesBlockOf(e: unknown): string[] | null {
  if (!(e instanceof ApiError)) return null;
  const d = asDict(e.data.detail);
  const code = e.code || str(d.code) || str(e.data.code) || str(e.data.detail);
  if (code !== RULES_CODE) return null;
  return ruleIds([d.missing_rule_ids, e.data.missing_rule_ids, d.rule_ids, d.missing_rules].find(Array.isArray));
}

// The sheet's order (web drawer): the rules a configuration or a refusal named first, then the other pending ones, then the
// accepted. A named rule the list does not carry comes from `extra` (the configuration's required rules), as not accepted yet.
export function orderRules(list: ServiceRule[], focus: string[] = [], extra: ServiceRule[] = []): ServiceRule[] {
  const named = new Set(focus);
  const missing = focus.filter((id) => !list.some((r) => r.id === id)).map((id) => extra.find((r) => r.id === id)).filter((r): r is ServiceRule => !!r);
  const all = [...list, ...missing.map((r) => ({ ...r, accepted: false, acceptedAt: "" }))];
  const rank = (r: ServiceRule) => (r.accepted ? 2 : named.has(r.id) ? 0 : 1);
  return all.map((r, i) => ({ r, i })).sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i).map((x) => x.r);
}

// True when the ISO date lies ahead of `now` ("takes effect on" vs "in force since").
export const isFuture = (iso: string, now: number = Date.now()): boolean => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) && t > now;
};
