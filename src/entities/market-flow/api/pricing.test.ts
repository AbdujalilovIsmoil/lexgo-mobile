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
