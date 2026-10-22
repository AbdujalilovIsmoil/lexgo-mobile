import { normCreated, normOptions, normPromotion, normQuote } from "./norm";

describe("second opinion norm", () => {
  it("reads the promotion and keeps the backend's texts; no price anywhere", () => {
    const p = normPromotion({ visible: true, order_id: "o1", placement: "completed", title: "T", description: "D", benefits: ["a", " ", "b"], dismissible: true, price_visible: false, cta_label: "Go", options_url: "/o", quote_url: "/q", event_url: "/e", amount: 5000 });
    expect(p).toMatchObject({ visible: true, orderId: "o1", placement: "completed", title: "T", benefits: ["a", "b"], dismissible: true, priceVisible: false, ctaLabel: "Go", optionsUrl: "/o", quoteUrl: "/q", eventUrl: "/e" });
    expect(JSON.stringify(p)).not.toContain("5000");
  });
  it("a promotion is not visible unless the backend says so", () => {
    expect(normPromotion({ visible: "true" }).visible).toBe(false);
    expect(normPromotion(null).visible).toBe(false);
  });
  it("reads the options: two channels, the count range with its default clamped into it", () => {
    const o = normOptions({ order_id: "o", service_title: "S", channels: [{ value: "video", label: "Video" }, { value: "chat", label: "Chat" }, { value: "x", label: "?" }], lawyer_count: { minimum: 2, maximum: 7, default: 9 }, direction_suggestions: ["Cat"], quote_url: "/q" });
    expect(o.channels.map((c) => c.value)).toEqual(["video", "chat"]);
    expect([o.minCount, o.maxCount, o.defaultCount]).toEqual([2, 7, 7]);
    expect(o.directionSuggestions).toEqual(["Cat"]);
  });
  it("options without a range fall back to 2–7", () => {
    const o = normOptions({});
    expect([o.minCount, o.maxCount, o.defaultCount]).toEqual([2, 7, 2]);
  });
  it("reads the quote with its request payload untouched", () => {
    const payload = { service_kind: "second_opinion_group", channel: "video", lawyer_count: 3, directions: ["D"], source_order_id: "o", promotion_session_id: "s" };
    const q = normQuote({ channel: "video", lawyer_count: 3, directions: ["D"], amount: 600000, currency: "UZS", price_visible: true, selection_complete: true, request_url: "/urgent-advokat/requests", request_payload: payload });
    expect(q).toMatchObject({ channel: "video", count: 3, amount: 600000, currency: "UZS", priceVisible: true, selectionComplete: true, requestUrl: "/urgent-advokat/requests" });
    expect(q.requestPayload).toEqual(payload);
  });
  it("reads the created request, wrapped or not", () => {
    expect(normCreated({ id: "r1", work_id: "W-1" })).toEqual({ id: "r1", workId: "W-1" });
    expect(normCreated({ urgent_request: { id: "r2", work_id: "W-2" } })).toEqual({ id: "r2", workId: "W-2" });
  });
});
