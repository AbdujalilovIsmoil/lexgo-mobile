import { configBody, normConfig } from "./configApi";

describe("marketplace configuration (web parity)", () => {
  it("builds the body from the given fields only and rounds the price", () => {
    expect(configBody({})).toEqual({});
    expect(configBody({ negotiationAllowed: false })).toEqual({ negotiation_allowed: false });
    expect(configBody({ enabled: true, selectedPrice: 1234.6, negotiationAllowed: true })).toEqual({ enabled: true, selected_price: 1235, negotiation_allowed: true });
    expect(configBody({ selectedPrice: NaN })).toEqual({});
  });
  it("reads a nested configuration with a list explanation", () => {
    const c = normConfig({ configuration: { service_id: "s1", enabled: true, selected_price: "500000", negotiation_allowed: false }, price_explanation: ["a", { text: "b" }, ""] }, "x");
    expect(c).toEqual({ serviceId: "s1", enabled: true, selectedPrice: 500000, negotiationAllowed: false, priceExplanation: "a b", priceExplanationLines: ["a", "b"] });
  });
  it("reads a flat answer with an object or string explanation; unknown flags stay null", () => {
    expect(normConfig({ price_explanation: { message: "m", steps: ["1", "2"] } }, "s")).toMatchObject({ serviceId: "s", enabled: null, negotiationAllowed: null, priceExplanation: "m", priceExplanationLines: ["1", "2"] });
    expect(normConfig({ price_explanation: " hi " }).priceExplanation).toBe("hi");
  });
});
