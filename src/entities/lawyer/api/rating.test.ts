import { normMyRating, normPublicRating } from "./ratingApi";

// The live sample of GET /marketplace/lawyers/{id}/rating.
const LIVE = { seller_user_id: "f", public_rating: 1.75, ranking_score: 35.08, reviews_count: 3, rating_status: "rated", components: { client_reviews: 26.67, completion_rate: 77.78, response_score: 49.17, acceptance_rate: 50.0, verified_experience: 0.7000000000000001 }, metrics: { completed_orders: 7, terminal_orders: 9, average_response_seconds: 915, verified_experience_years: 0.07 }, calculated_at: "2026-10-27T08:39:59.753102+00:00", policy_version: 2, unrated_display: "Hali baholanmagan" };

describe("normPublicRating", () => {
  it("rated: the rating and the review count, nothing internal", () => {
    const r = normPublicRating(LIVE);
    expect(r).toEqual({ rated: true, rating: 1.75, reviews: 3, unratedText: "Hali baholanmagan" });
    expect(JSON.stringify(r)).not.toMatch(/35\.08|ranking|components|metrics/);
  });
  it("unrated: never a client score, the backend's text is kept", () => {
    expect(normPublicRating({ public_rating: 5, reviews_count: 0, rating_status: "unrated", unrated_display: " Hali baholanmagan " })).toMatchObject({ rated: false, unratedText: "Hali baholanmagan" });
  });
  it("missing or junk fields are unrated, not a crash", () => {
    expect(normPublicRating(undefined)).toEqual({ rated: false, rating: 0, reviews: 0, unratedText: "" });
    expect(normPublicRating({ rating_status: "rated" }).rated).toBe(false);
    expect(normPublicRating({ public_rating: "4.5", reviews_count: "2", rating_status: "rated" })).toMatchObject({ rated: true, rating: 4.5, reviews: 2 });
  });
});

describe("normMyRating", () => {
  it("keeps the backend's components in the contract's order and its numbers as they are", () => {
    const r = normMyRating({ ...LIVE, components: { verified_experience: 0.7, client_reviews: 120, zzz_new: 5, response_score: "49.5" } });
    expect(r.parts.map((p) => p.key)).toEqual(["client_reviews", "response_score", "verified_experience", "zzz_new"]);
    expect(r.parts[0].value).toBe(120);
    expect(r.parts[1].value).toBe(49.5);
  });
  it("reads penalty fields, metrics and the policy", () => {
    const r = normMyRating({ ...LIVE, components: { client_reviews: 10, complaint_penalty: 4 }, penalties: { refunds: 2, junk: "x" } });
    expect(r.parts.filter((p) => p.penalty).map((p) => p.key)).toEqual(["complaint_penalty", "refunds"]);
    expect(r).toMatchObject({ completed: 7, terminal: 9, responseSeconds: 915, experienceYears: 0.07, policyVersion: "2", calculatedAt: LIVE.calculated_at, rated: true, rating: 1.75 });
  });
  it("an empty answer has nothing but the unrated state", () => {
    expect(normMyRating({})).toMatchObject({ rated: false, parts: [], completed: null, terminal: null, responseSeconds: null, experienceYears: null, policyVersion: "" });
    expect(normMyRating({ metrics: { completed_orders: null, average_response_seconds: "" } })).toMatchObject({ completed: null, responseSeconds: null });
  });
});
