import { asArr, asDict, asStr, uzs, type Dict } from "@/shared/lib/json";
import { forSeller, normRule, ruleIds } from "@/entities/service-rules/lib/normalize";
import type { ReqValue, Requirement, ServiceConfig } from "./types";

const str = (v: unknown): string => asStr(v).trim();
const bool = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);
const num = (v: unknown): number | null => (v === null || v === undefined || v === "" || typeof v === "boolean" || Array.isArray(v) ? null : Number.isFinite(Number(v)) ? Number(v) : null);
const line = (v: unknown): string => (typeof v === "string" || typeof v === "number" ? String(v).trim() : str(asDict(v).text ?? asDict(v).label ?? asDict(v).message ?? asDict(v).title));

// A status that means "switched on, waiting for the rules" (web RULES_PENDING).
const RULES_PENDING = /^(rules?_pending|pending_rules?|rules?_acceptance_required)$/;

// price_explanation is a string, a list of strings/objects, or { text|message|summary|explanation, lines|items|steps|breakdown }.
function normExplanation(v: unknown): { text: string; lines: string[] } {
  if (typeof v === "string") return { text: v.trim(), lines: [] };
  if (Array.isArray(v)) {
    const lines = v.map(line).filter(Boolean);
    return { text: lines.join(" "), lines };
  }
  const d = asDict(v);
  const lines = asArr([d.lines, d.items, d.steps, d.breakdown].find(Array.isArray)).map(line).filter(Boolean);
  return { text: str(d.text ?? d.message ?? d.summary ?? d.explanation) || lines.join(" "), lines };
}

// Scalars and objects stay as sent; a numeric string becomes a number, anything else unknown becomes null.
const value = (v: unknown): ReqValue =>
  typeof v === "boolean" ? v : v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : typeof v === "string" && v.trim() && !Number.isFinite(Number(v)) ? v.trim() : num(v);

// One requirements[] item. `met` is only the backend's verdict and `progress` is kept as given (TZ: never derived here).
export function normRequirement(raw: unknown): Requirement | null {
  const d = asDict(raw);
  const key = str(d.key ?? d.code ?? d.criterion ?? d.type);
  const label = str(d.label ?? d.title ?? d.name);
  if (!key && !label) return null;
  return {
    key,
    label,
    current: value(d.current ?? d.current_value ?? d.actual ?? d.value),
    required: value(d.required ?? d.required_value ?? d.target ?? d.minimum),
    unit: str(d.unit).toLowerCase(),
    met: (d.met ?? d.satisfied ?? d.is_met) === true,
    progress: num(d.progress_percent ?? d.progress ?? d.percent),
    note: str(d.text ?? d.message ?? d.hint ?? d.description),
  };
}

// The configuration may sit under configuration | config | seller_service or at the top level. The top-level pricing fields
// win; pricing_limits only fills what they lack ("frontend cards should use the stable top-level fields").
export function normConfig(raw: unknown, serviceId = ""): ServiceConfig {
  const a = asDict(raw);
  const inner = asDict(a.configuration ?? a.config ?? a.seller_service);
  const n = Object.keys(inner).length ? inner : a;
  const lim = asDict(n.pricing_limits ?? a.pricing_limits ?? n.limits);
  const pick = (k: string): unknown => n[k] ?? a[k] ?? lim[k];
  const ex = normExplanation(a.price_explanation ?? n.price_explanation);
  const status = str(n.status ?? a.status).toLowerCase();
  const rulesStatus = str(pick("rules_status")).toLowerCase();
  const required = asArr(pick("required_rules")).filter(forSeller).map(normRule).filter((r) => r.id || r.title);
  const selectableRaw = asArr(pick("selectable_rules")).filter((x) => forSeller(x) && asDict(x).seller_selectable !== false);
  const accepted = bool(pick("rules_accepted"));
  const named = ruleIds(pick("missing_rule_ids"));
  const missing = named.length || accepted !== false ? named : required.filter((r) => !r.accepted && r.id).map((r) => r.id);
  const selected = pick("selected_rule_ids");
  const flagged = selectableRaw.filter((x) => asDict(x).selected === true);
  return {
    serviceId: str(n.service_id ?? a.service_id) || serviceId,
    enabled: bool(n.enabled ?? n.is_enabled ?? n.is_active),
    status,
    selectedPrice: uzs(n, "selected_price", "configured_price", "price"),
    minimumListingPrice: Math.max(0, uzs(n, "minimum_listing_price") || uzs(lim, "minimum_listing_price")),
    maximumPrice: uzs(n, "maximum_price", "max_price") || uzs(lim, "maximum_price", "max_price"),
    recommendedPrice: uzs(n, "recommended_price") || uzs(lim, "recommended_price", "recommended"),
    maxDiscountPercent: num(pick("maximum_listing_discount_percent")),
    negotiationAllowed: bool(n.negotiation_allowed ?? n.negotiation_enabled),
    negotiationAvailable: bool(pick("negotiation_available")),
    negotiationMinimumPrice: Math.max(0, uzs(n, "negotiation_minimum_price") || uzs(lim, "negotiation_minimum_price")),
    priceExplanation: ex.text,
    priceExplanationLines: ex.lines,
    maxIncreasePercent: num(pick("maximum_increase_percent")) ?? 0,
    requirements: asArr(pick("requirements")).map(normRequirement).filter((r): r is Requirement => r !== null),
    rulesAccepted: accepted,
    rulesStatus,
    rulesPending: accepted === false || missing.length > 0 || rulesStatus === "pending" || RULES_PENDING.test(rulesStatus) || RULES_PENDING.test(status),
    missingRuleIds: missing,
    requiredRules: required,
    selectableRules: selectableRaw.map(normRule).filter((r) => r.id),
    selectedRuleIds: Array.isArray(selected) ? ruleIds(selected) : flagged.length ? ruleIds(flagged) : null,
  };
}
