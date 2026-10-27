import { normFlow, normPricing, normResolution } from "./norm";

describe("normPricing", () => {
  it("keeps the backend's components in order and its final price — the old ceiling modifiers are never price lines", () => {
    const p = normPricing({
      currency: "UZS",
      components: [
        { code: "base_price", amount: 850000, explanation: { uz: "Xizmatning asosiy narxi", ru: "Базовая стоимость услуги", en: "Base service price" } },
        { code: "selected_option", option_id: "urgent", amount: 29749, explanation: { uz: "Shoshilinch bajarish" } },
      ],
      modifiers: [{ code: "region", amount: 45000 }],
      final_price: 879749,
    });
    expect(p?.components.map((c) => [c.code, c.amount])).toEqual([["base_price", 850000], ["selected_option", 29749]]);
    expect(p?.components[1]).toMatchObject({ optionId: "urgent", explanation: { uz: "Shoshilinch bajarish" } });
    expect(p?.finalPrice).toBe(879749);
    expect(p?.historical).toBe(false);
  });

  it("marks a legacy backfill as a historical calculation", () => {
    expect(normPricing({ components: [{ code: "base_price", amount: 100 }], final_price: 100, snapshot_source: "legacy_backfill", historical_policy_exact: false })?.historical).toBe(true);
  });

  it("has nothing to explain without components", () => {
    expect(normPricing({ final_price: 879749, modifiers: [{ code: "region", amount: 45000 }] })).toBeNull();
    expect(normPricing(undefined)).toBeNull();
  });
});

describe("normResolution", () => {
  it("reads the offer the client may answer", () => {
    const r = normResolution({ can_choose: true, offer: { id: "o1", status: "pending_client_choice", options: ["reassign", "refund", "teleport"], deadline_at: "2026-10-27T12:30:00Z", message: " Tanlang ", selected_choice: null } });
    expect(r).toEqual({ canChoose: true, offer: { id: "o1", status: "pending_client_choice", options: ["reassign", "refund"], deadlineAt: "2026-10-27T12:30:00Z", message: "Tanlang", selected: "" } });
  });

  it("is null when the order has no resolution, and closed when the backend says so", () => {
    expect(normResolution(undefined)).toBeNull();
    expect(normResolution({ can_choose: false, offer: null, refund: null })).toEqual({ canChoose: false, offer: null });
  });
});

describe("normFlow", () => {
  it("carries the pricing snapshot from details and the resolution from the order", () => {
    const f = normFlow({ status: "resolution_required", resolution: { can_choose: true, offer: { options: ["refund"] } }, details: { pricing_snapshot: { components: [{ code: "base_price", amount: 5 }], final_price: 5 } } });
    expect(f.pricing?.finalPrice).toBe(5);
    expect(f.resolution?.offer?.options).toEqual(["refund"]);
  });
});

describe("normRefund", () => {
  it("reads the refund and says when an operator approves it by hand", () => {
    const { normRefund } = jest.requireActual("./norm") as typeof import("./norm");
    expect(normRefund({ order_id: "o", refund: { request_id: "r1", amount: 8000, currency: "UZS", status: "pending", provider_mode: "manual", provider_enabled: false, updated_at: "2026-10-26T15:59:59Z" }, provider_enabled: false }))
      .toEqual({ requestId: "r1", amount: 8000, currency: "UZS", status: "pending", manual: true, updatedAt: "2026-10-26T15:59:59Z" });
    expect(normRefund({ refund: { status: "SUCCEEDED", amount: 5, provider_enabled: true } })?.manual).toBe(false);
    expect(normRefund({ refund: null })).toBeNull();
  });
});

describe("duration and time left", () => {
  const { durationText, leftText } = jest.requireActual("../lib/duration") as typeof import("../lib/duration");
  const t = (k: string, p?: Record<string, string | number>) => `${k}:${p ? Object.values(p).join(",") : ""}`;
  it("words the delivery time in the app's own language, business days apart", () => {
    expect(durationText({ value: 5, unit: "day", calendar: "business_days" }, t)).toBe("mf.dur.dayBiz:5");
    expect(durationText({ value: 2, unit: "hour", calendar: "calendar" }, t)).toBe("mf.dur.hour:2");
    expect(durationText({ value: 3, unit: "hour", calendar: "business_days" }, t)).toBe("mf.dur.biz:mf.dur.hour:3");
    expect(durationText({ value: 1, unit: "weeks", calendar: "calendar" }, t)).toBe("mf.dur.day:1");
  });
  it("shows mm:ss in the last hour and days/hours before it", () => {
    expect(leftText(65_000, t)).toBe("01:05");
    expect(leftText(2 * 86_400_000 + 5 * 3_600_000, t)).toBe("mf.dur.day:2 mf.dur.hour:5");
    expect(leftText(3 * 3_600_000 + 12 * 60_000, t)).toBe("mf.dur.hour:3 mf.dur.minute:12");
  });
});
