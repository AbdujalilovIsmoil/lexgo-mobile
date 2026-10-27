import { asDict, asNum, asStr } from "@/shared/lib/json";
import { ApiError } from "@/shared/api";
import { planGateOf } from "@/entities/plan/lib/planGate";
import type { ChatLimit, GuestLimit } from "../model/types";

// `limit_status` of a guest reply and `detail` of the guest 429 share one shape.
export function normLimit(v: unknown): GuestLimit | undefined {
  if (!v || typeof v !== "object") return undefined;
  const d = asDict(v);
  return {
    dailyLimit: asNum(d.guest_daily_limit),
    totalLimit: asNum(d.guest_total_limit),
    usedToday: asNum(d.used_today),
    usedTotal: asNum(d.used_total),
    remainingToday: asNum(d.remaining_today),
    remainingTotal: asNum(d.remaining_total),
    registerOffer: d.register_offer === true,
    registeredFree: asNum(d.registered_free_limit),
    resetsAt: asStr(d.daily_window_resets_at) || undefined,
  };
}

// 429 guest_*_limit_exceeded, a 402 by its code (TZ.md subscription usage limits: ai_subscription_required and feature_limit_exhausted are a
// used-up quota; active_subscription_required, feature_not_in_plan and an unknown 402 are the plan), other 429s; null when not a limit.
export function limitFromError(e: unknown): ChatLimit | null {
  if (!(e instanceof ApiError)) return null;
  const detail = asDict(e.data.detail);
  const code = asStr(detail.code ?? e.code);
  if (e.status === 429 && (code === "guest_daily_limit_exceeded" || code === "guest_total_limit_exceeded")) {
    return { kind: code === "guest_daily_limit_exceeded" ? "guest_daily" : "guest_total", guest: normLimit(detail), message: asStr(detail.message) };
  }
  const gate = planGateOf(e);
  if (gate) {
    const quota = gate.code === "ai_subscription_required" || gate.code === "feature_limit_exhausted";
    return { kind: quota ? "quota" : "plan", gate, used: gate.used ?? undefined, monthlyLimit: gate.limit ?? undefined, message: e.detail };
  }
  if (e.status === 429) return { kind: "rate", retryAfter: e.retryAfter, message: e.detail };
  return null;
}
