import { asDict, asNum, asStr } from "@/shared/lib/json";
import { ApiError } from "@/shared/api";
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

// 429 guest_*_limit_exceeded, 402 ai_subscription_required, other 429s; null when the error is not a limit.
export function limitFromError(e: unknown): ChatLimit | null {
  if (!(e instanceof ApiError)) return null;
  const detail = asDict(e.data.detail);
  const code = asStr(detail.code ?? e.code);
  if (e.status === 429 && (code === "guest_daily_limit_exceeded" || code === "guest_total_limit_exceeded")) {
    return { kind: code === "guest_daily_limit_exceeded" ? "guest_daily" : "guest_total", guest: normLimit(detail), message: asStr(detail.message) };
  }
  if (e.status === 402) return { kind: "quota", used: asNum(detail.used), monthlyLimit: asNum(detail.monthly_limit), message: e.detail };
  if (e.status === 429) return { kind: "rate", retryAfter: e.retryAfter, message: e.detail };
  return null;
}
