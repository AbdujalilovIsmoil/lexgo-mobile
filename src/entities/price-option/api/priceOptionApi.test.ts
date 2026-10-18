import { normOptions, normQuote } from "./priceOptionApi";

describe("price options", () => {
  it("reads sections and options, dropping empty sections", () => {
    const o = normOptions({ target_type: "package", target_id: "p", base_price: 500000, currency: "UZS", sections: [
      { id: "s", title: "Conditions", options: [{ id: "a", label: "A", adjustment_type: "fixed", value: 25000 }, { id: "b", label: "B", adjustment_type: "percent", value: 10 }] },
      { id: "empty", options: [] },
    ] });
    expect(o.targetType).toBe("package");
    expect(o.sections).toHaveLength(1);
    expect(o.sections[0].options.map((x) => x.type)).toEqual(["fixed", "percent"]);
  });
  it("takes the quote total from the backend, never computes it", () => {
    const q = normQuote({ quote: { base_price: 100000, additional_amount: 35000, total_price: 135000, currency: "UZS", selected_option_ids: ["a", "b"], breakdown: [{ id: "a", label: "A", amount: 25000, adjustment_type: "fixed", value: 25000 }, { id: "b", label: "B", amount: 10000, adjustment_type: "percent", value: 10 }] } });
    expect(q.totalPrice).toBe(135000);
    expect(q.lines.map((l) => l.amount)).toEqual([25000, 10000]);
    expect(q.selectedIds).toEqual(["a", "b"]);
  });
  it("an empty selection is the base price", () => expect(normQuote({ quote: { base_price: 100, total_price: 100, selected_option_ids: [], breakdown: [] } }).lines).toEqual([]));
});
