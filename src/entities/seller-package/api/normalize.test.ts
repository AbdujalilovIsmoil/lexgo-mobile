import { normPackage, reasonsOf } from "./normalize";

describe("seller package", () => {
  it("collects every eligibility text the backend sends", () => {
    expect(reasonsOf({ eligible: false, reasons: ["Extended verification required", { message: "Upload documents" }], reason: "Extended verification required" })).toEqual(["Extended verification required", "Upload documents"]);
    expect(reasonsOf(null)).toEqual([]);
  });
  it("maps a manage row; the price is never editable unless the backend says so", () => {
    const p = normPackage({ id: "p1", package_code: "BIZ", title: "Biz", enabled: true, status: "ACTIVE", price_editable: false, eligibility: { eligible: true }, tiers: [{ tier: "premium", price: 150, eligibility: { eligible: false, reasons: ["Needs extended verification"] } }], components: [{ title: "Consult" }], custom_items: [{ title: "Report" }] });
    expect(p).toMatchObject({ id: "p1", enabled: true, status: "active", priceEditable: false, eligible: true, items: ["Consult", "Report"] });
    expect(p.tiers[0]).toMatchObject({ tier: "PREMIUM", price: 150, eligible: false, reasons: ["Needs extended verification"] });
    expect(normPackage({ id: "p2" })).toMatchObject({ enabled: false, status: "", eligible: true });
  });
});
