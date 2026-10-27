import { normQuote } from "./quoteApi";
import { normPlanRequest } from "./purchaseApi";

describe("subscription plan quote (TZ.md MP09 / Subscription plan quote)", () => {
  it("reads the spec's example with a campaign as the backend sent it", () => {
    expect(normQuote({
      plan_id: "uuid", plan_slug: "client-standard", billing_period: "monthly", months: 1,
      base_amount: 99000, discount_amount: 30000, amount: 69000, currency: "UZS",
      campaign: { id: "campaign-id", title: "Autumn discount", discount_type: "fixed", discount_value: 30000, ends_at: "2026-11-01T00:00:00Z" },
    })).toEqual({
      months: 1, base: 99000, discount: 30000, amount: 69000, currency: "UZS",
      campaign: { id: "campaign-id", title: "Autumn discount", discountType: "fixed", discountValue: 30000, endsAt: "2026-11-01T00:00:00Z" },
    });
  });

  it("keeps the backend's own amount — a percent campaign is never worked out on the phone", () => {
    // Production answer (2026-10-27, lexgo-ai-lite, monthly): 2 % of 49 990 is 999.8, the backend took 1 000 off and asks 48 990.
    const q = normQuote({ months: 1, base_amount: 49990, discount_amount: 1000, amount: 48990, currency: "UZS", campaign: { id: "9a66", title: "test Bek", discount_type: "percent", discount_value: 2, ends_at: "2026-10-31T09:00:00+05:00" } });
    expect(q).toMatchObject({ base: 49990, discount: 1000, amount: 48990, campaign: { discountType: "percent", discountValue: 2 } });
    // Whatever the numbers, the amount shown is the one the backend sent.
    expect(normQuote({ base_amount: 100000, discount_amount: 10000, amount: 95000 })?.amount).toBe(95000);
  });

  it("has no campaign and no discount when none applies", () => {
    expect(normQuote({ months: 1, base_amount: 149000, discount_amount: 0, amount: 149000, currency: "UZS", campaign: null })).toEqual({ months: 1, base: 149000, discount: 0, amount: 149000, currency: "UZS", campaign: null });
  });

  it("reads string numbers and fills a missing base or discount without inventing a price", () => {
    expect(normQuote({ amount: "564300", base_amount: "564300" })).toMatchObject({ amount: 564300, base: 564300, discount: 0, currency: "UZS" });
    expect(normQuote({ amount: 49990 })).toMatchObject({ base: 49990, discount: 0 });
  });

  it("is null when there is no amount to show", () => {
    expect(normQuote(null)).toBeNull();
    expect(normQuote({ base_amount: 99000, discount_amount: 0 })).toBeNull();
    expect(normQuote({ amount: "" })).toBeNull();
  });
});

describe("Telegram purchase request answer", () => {
  it("reads the stored pricing and shows its amount", () => {
    const r = normPlanRequest({
      id: "r1", work_id: "SUB-0042", status: "pending", amount: 279300, telegram_sent: true,
      pricing: { months: 6, base_amount: 279300, discount_amount: 5586, amount: 273714, currency: "UZS", campaign: { id: "c", title: "test Bek" } },
    });
    expect(r).toMatchObject({ id: "r1", workId: "SUB-0042", status: "pending", sent: true, failed: 0, amount: 273714 });
    expect(r.pricing).toMatchObject({ base: 279300, discount: 5586, amount: 273714, campaign: { title: "test Bek" } });
  });

  it("works without pricing (older answers) and counts undelivered Telegram messages", () => {
    const r = normPlanRequest({ id: "r2", payload: { amount: 149000, telegram_results: [{ ok: true }, { ok: false }] } });
    expect(r).toMatchObject({ amount: 149000, sent: true, failed: 1, pricing: null, status: "pending" });
  });
});
