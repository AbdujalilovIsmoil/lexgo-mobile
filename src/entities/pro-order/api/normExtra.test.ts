import { normAdditional, normPackSnap, normQuoteSnap, normRating, normResult } from "./normExtra";

describe("seller order payload", () => {
  it("reads the quote snapshot and the chosen option ids", () => {
    const q = normQuoteSnap({ quote_snapshot: { quote: { base_price: 100, additional_amount: 50, total_price: 150, selected_option_ids: ["u"], breakdown: [{ id: "u", label: "Urgent", amount: 50 }] } } });
    expect(q).toMatchObject({ base: 100, additional: 50, total: 150, optionIds: ["u"], options: [{ id: "u", label: "Urgent", amount: 50 }] });
    expect(normQuoteSnap({}).options).toEqual([]);
  });
  it("reads the package snapshot, result and the additional request", () => {
    expect(normPackSnap({ package_snapshot: { package_id: "p", title: "Biz", tier: { tier: "premium", duration: "30 days", included: ["A"] } } })).toMatchObject({ id: "p", tier: "PREMIUM", included: ["A"] });
    expect(normPackSnap({})).toBeNull();
    expect(normResult({ result: { result_text: " ok ", result_files: [{ file_id: "f", file_name: "a.pdf", download_url: "/secure-files/f" }] } })).toMatchObject({ text: "ok", files: [{ fileId: "f", fileName: "a.pdf" }] });
    expect(normAdditional({ additional_payment: { id: "r", status: "PENDING", expires_at: "2026-10-15T10:00:00Z", selected_option_ids: ["a"] } })).toMatchObject({ status: "pending", optionIds: ["a"] });
    expect(normAdditional({})).toBeNull();
  });
  it("reads the rating state", () => {
    const r = normRating({ rating: { available: true, closed: false, reason: "", deadline_at: "2026-10-14T12:15:00Z", remaining_seconds: 900 } });
    expect(r).toMatchObject({ available: true, closed: false, deadlineAt: "2026-10-14T12:15:00Z", remainingSeconds: 900, stars: 0 });
    expect(normRating({ rating: { available: false, closed: true, reason: "rating_window_closed", value: 4 } })).toMatchObject({ closed: true, stars: 4 });
  });
});

describe("real backend shapes", () => {
  it("reads a supplemental request from the order's payment", () => {
    const a = normAdditional({ details: { additional_payment_request_id: "r1" }, payment: { target_type: "marketplace_additional_payment", status: "pending", created_at: "2026-10-14T14:00:00Z", provider_payload: { selected_option_ids: ["a"], option_quote: { total_price: 135000 } } } });
    expect(a).toMatchObject({ id: "r1", status: "pending", total: 135000, optionIds: ["a"], expiresAt: "2026-10-15T14:00:00.000Z" });
  });
  it("has no request on an ordinary order", () => expect(normAdditional({ payment: { target_type: "marketplace_order" }, details: {} })).toBeNull());
  it("reads the given stars from details.rating", () => expect(normRating({ rating: { available: false, closed: true, reason: "submitted" }, details: { rating: 1, rating_comment: "bad" } })).toMatchObject({ stars: 1, comment: "bad" }));
});

it("reads details.option_quote as the quote snapshot", () => {
  const q = normQuoteSnap({ details: { option_quote: { base_price: 100000, additional_amount: 35000, total_price: 135000, selected_option_ids: ["a", "b"], breakdown: [{ id: "a", label: "A", amount: 25000 }, { id: "b", label: "B", amount: 10000 }] } } });
  expect(q).toMatchObject({ base: 100000, total: 135000, optionIds: ["a", "b"] });
  expect(q.options).toHaveLength(2);
});
