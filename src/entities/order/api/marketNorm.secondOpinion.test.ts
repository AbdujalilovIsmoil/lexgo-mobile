import { normMarketOrder } from "./marketNorm";

describe("normMarketOrder second opinion link", () => {
  it("reads actions.second_opinion_promotion", () => {
    expect(normMarketOrder({ id: "o", actions: { second_opinion_promotion: "/marketplace/orders/o/second-opinion-promotion" } }).secondOpinionUrl).toBe("/marketplace/orders/o/second-opinion-promotion");
  });
  it("reads second_opinion_promotion_url", () => {
    expect(normMarketOrder({ id: "o", second_opinion_promotion_url: "/u" }).secondOpinionUrl).toBe("/u");
  });
  it("is empty when the backend sends null — the promotion is not rendered", () => {
    expect(normMarketOrder({ id: "o", second_opinion_promotion_url: null, actions: { second_opinion_promotion: null } }).secondOpinionUrl).toBe("");
    expect(normMarketOrder({ id: "o" }).secondOpinionUrl).toBe("");
  });
});
