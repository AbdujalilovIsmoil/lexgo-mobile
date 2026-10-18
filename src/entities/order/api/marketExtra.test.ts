import { normOrderExtra, normOrderRating, normResultFiles } from "./marketExtra";

const details = {
  option_quote: { base_price: 300000, additional_amount: 25000, total_price: 325000, currency: "UZS", selected_option_ids: ["a"], breakdown: [{ id: "a", label: "Tashkent", adjustment_type: "fixed", value: 25000, amount: 25000 }] },
  package_snapshot: { title: "Pkg", package_code: "P-1", price: 300000, components: [{}], custom_items: [{ title: "Report", required: true }], terms: { included: ["A"], excluded: [] } },
  rating_submitted: false,
};

describe("order extras", () => {
  it("keeps the backend quote and package snapshot", () => {
    const x = normOrderExtra({ result_text: " done ", result_files: [{ name: "r.pdf", url: "/storage/r.pdf" }], rating: { available: true, closed: false, reason: "", deadline_at: "2026-10-14T12:15:00Z", remaining_seconds: 900 }, rating_url: "/r" }, details, 1000);
    expect(x.quote?.totalPrice).toBe(325000);
    expect(x.quote?.lines[0].amount).toBe(25000);
    expect(x.pack).toMatchObject({ title: "Pkg", code: "P-1", components: 1, included: ["A"] });
    expect(x.resultText).toBe("done");
    expect(x.rating).toMatchObject({ available: true, remainingSeconds: 900, fetchedAt: 1000 });
    expect(x.ratingUrl).toBe("/r");
  });
  it("has no quote or package for a plain order", () => {
    const x = normOrderExtra({}, {});
    expect(x.quote).toBeNull();
    expect(x.pack).toBeNull();
    expect(x.rating).toBeNull();
  });
  it("reads a closed rating window", () => expect(normOrderRating({ available: false, closed: true, reason: "expired", remaining_seconds: 0 }, 1)).toMatchObject({ available: false, closed: true, reason: "expired" }));
  it("reads both file shapes and drops the pathless", () => {
    expect(normResultFiles([{ file_name: "a.pdf", download_url: "/secure-files/1", file_id: "1" }, { name: "x" }])).toEqual([{ name: "a.pdf", path: "/secure-files/1", id: "1" }]);
  });
});

describe("real backend shapes", () => {
  it("reads a supplemental payment from the order's payment", () => {
    const x = normOrderExtra({ payment: { target_type: "marketplace_additional_payment", status: "pending", amount: 35000, created_at: "2026-10-14T14:00:00Z", provider_payload: { option_quote: { total_price: 135000 } } } }, { additional_payment_request_id: "r1" });
    expect(x.addPay).toMatchObject({ id: "r1", status: "pending", amount: 35000, total: 135000, expiresAt: "2026-10-15T14:00:00.000Z" });
  });
  it("reads the given stars", () => expect(normOrderExtra({}, { rating: 1, rating_comment: " bad " })).toMatchObject({ ratingStars: 1, ratingComment: "bad", addPay: null }));
});
