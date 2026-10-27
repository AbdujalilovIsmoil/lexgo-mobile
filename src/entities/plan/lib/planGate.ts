import { ApiError } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { PlanFeature } from "../model/features";
import type { Plan } from "../model/types";
import { findByKey, numOrNull } from "./terms";

// TZ.md "subscription usage limits": a 402 names why the plan stops the action. Each code has its own text; `plan_required` covers an older
// or unknown 402 (its own sentence, if the server sent one, is kept in `message`).
export const GATE_CODES = ["feature_limit_exhausted", "active_subscription_required", "feature_not_in_plan", "ai_subscription_required", "plan_required"] as const;
export type GateCode = (typeof GATE_CODES)[number];
export type PlanGate = { code: GateCode; featureKey: string; limit: number | null; used: number | null; remaining: number | null; unit: string; resetsAt: string; message: string };

// Document-settings refusals that mean one of the four (the web maps them the same way).
const SAME: Record<string, GateCode> = { document_subscription_required: "active_subscription_required", document_plan_not_allowed: "feature_not_in_plan", document_entitlement_required: "feature_not_in_plan" };
// Document-settings refusals no plan lifts (a mode switched off for everybody, a closed download format): never a plan gate, whatever
// their status — the document screens say them in words.
const NOT_PLAN = new Set(["document_mode_disabled", "document_download_format_disabled"]);
// The feature a code is about when its body names none.
const FEATURE_OF: Record<string, string> = { ai_subscription_required: "ai_requests", manual_document_plan_required: "manual_document_fill" };

const gate = (code: GateCode, featureKey: string, more: Partial<PlanGate> = {}): PlanGate => ({ code, featureKey, limit: null, used: null, remaining: null, unit: "", resetsAt: "", message: "", ...more });

// The 402 of any paid action as a gate; null for every other error.
export function planGateOf(e: unknown): PlanGate | null {
  if (!(e instanceof ApiError) || e.status !== 402) return null;
  const d = asDict(e.data.detail);
  const raw = asStr(d.code) || e.code || "";
  if (NOT_PLAN.has(raw)) return null;
  const code = (GATE_CODES as readonly string[]).includes(raw) ? (raw as GateCode) : SAME[raw] ?? "plan_required";
  return gate(code, asStr(d.feature_key) || FEATURE_OF[raw] || "", {
    limit: numOrNull(d.limit) ?? numOrNull(d.monthly_limit),
    used: numOrNull(d.used),
    remaining: numOrNull(d.remaining),
    unit: asStr(d.unit),
    resetsAt: asStr(d.resets_at),
    message: e.detail ?? "",
  });
}

// The backend's own feature state stops the action before it is tried: a locked feature, or a limited one with nothing left.
export function gateOfFeature(f: PlanFeature | null | undefined, key: string): PlanGate | null {
  if (!f) return null;
  if (f.mode === "unavailable") return gate("feature_not_in_plan", key, { unit: f.unit });
  if (f.mode === "limited" && (f.remaining === 0 || !f.allowed)) return gate("feature_limit_exhausted", key, { limit: f.limit, used: f.used, remaining: f.remaining, unit: f.unit, resetsAt: f.resetsAt });
  return null;
}

// Whether buying `plan` lifts the gate: its current tariff gives the feature — when the gate knows the limit in force, unlimited or a
// bigger one. A gate that names no feature matches no plan (the tariffs page is the way then).
export function liftsGate(plan: Plan, g: PlanGate): boolean {
  if (!g.featureKey) return false;
  const term = findByKey(plan.contract, g.featureKey);
  if (!term || term.mode === "unavailable") return false;
  return g.limit === null || term.mode === "unlimited" || (term.limit ?? 0) > g.limit;
}
