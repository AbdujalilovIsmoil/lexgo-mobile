import { parseErrorBody } from "@/shared/api";
import { limitFromError } from "./normalizeLimit";

describe("AI chat refusals", () => {
  it("branches a 402 on its code instead of calling every 402 a quota", () => {
    const ai = limitFromError(parseErrorBody(402, { detail: { code: "ai_subscription_required", used: 100, monthly_limit: 100 } }));
    expect(ai).toMatchObject({ kind: "quota", used: 100, monthlyLimit: 100, gate: { code: "ai_subscription_required" } });
    const spent = limitFromError(parseErrorBody(402, { detail: { code: "feature_limit_exhausted", feature_key: "ai_requests", limit: 20, used: 20, remaining: 0, resets_at: "2026-11-24T00:00:00+00:00" } }));
    expect(spent).toMatchObject({ kind: "quota", used: 20, monthlyLimit: 20, gate: { code: "feature_limit_exhausted", featureKey: "ai_requests", resetsAt: "2026-11-24T00:00:00+00:00" } });
    expect(limitFromError(parseErrorBody(402, { detail: { code: "active_subscription_required" } }))).toMatchObject({ kind: "plan", gate: { code: "active_subscription_required" } });
    expect(limitFromError(parseErrorBody(402, { detail: { code: "feature_not_in_plan", feature_key: "ai_requests" } }))).toMatchObject({ kind: "plan", gate: { code: "feature_not_in_plan" } });
  });

  it("keeps the guest limits and other 429s as they were", () => {
    expect(limitFromError(parseErrorBody(429, { detail: { code: "guest_daily_limit_exceeded", guest_daily_limit: 3, used_today: 3, message: "m" } }))).toMatchObject({ kind: "guest_daily", message: "m", guest: { dailyLimit: 3, usedToday: 3 } });
    expect(limitFromError(parseErrorBody(429, { detail: "slow down" }, "7"))).toMatchObject({ kind: "rate", retryAfter: 7 });
    expect(limitFromError(parseErrorBody(500, {}))).toBeNull();
    expect(limitFromError(new Error("x"))).toBeNull();
  });
});
