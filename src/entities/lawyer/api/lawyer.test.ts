import { http } from "@/shared/api";
import { getMyMatches } from "./matchApi";
import { normLawyer } from "./normalize";
import { hasPromoTarget, normPromo } from "./normPromo";
import { normReview, normService } from "./normService";
import { buildQuery, isLocalMode } from "./query";
import { activeFilterCount, defaultLawyerFilters } from "../model/filters";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("normLawyer", () => {
  it("reads the marketplace seller card", () => {
    const l = normLawyer({ id: "s1", user_id: "u1", lawyer_name: " Ali Valiyev ", region: "tashkent", rating: 4.8, reviews_count: 12, seller_type: "advokat", verification_status: "approved", services: [{ id: "a", title: "Nikoh", base_price: 100000 }, { id: "b", title: "Mehnat", base_price: 50000 }, { title: "no id" }] });
    expect(l).toMatchObject({ id: "s1", userId: "u1", name: "Ali Valiyev", kind: "advocate", verified: true, rated: true, basePrice: 50000, priceTo: 100000 });
    expect(l.services).toHaveLength(2);
  });
  it("a young seller with few reviews is new and unrated", () => {
    const l = normLawyer({ id: "x", rating: 5, reviews_count: 1, created_at: new Date(Date.now() - 5 * 86_400_000).toISOString() });
    expect(l).toMatchObject({ isNew: true, rated: false });
    expect(normLawyer({ id: "x", created_at: "2020-01-01T00:00:00Z" }).isNew).toBe(false);
  });
  it("trusts rating_status over the 5-review rule", () => {
    expect(normLawyer({ rating: 4.5, reviews_count: 1, rating_status: "rated" }).rated).toBe(true);
    expect(normLawyer({ rating: 4.5, reviews_count: 50, rating_status: "new" }).rated).toBe(false);
  });
  it("offline availability, promotion and junk input", () => {
    expect(normLawyer({ availability: { status: "offline" } }).available).toBe(false);
    expect(normLawyer({ promotion: { active: true, service_title: "S" } })).toMatchObject({ promoted: true, promotedService: "S" });
    expect(normLawyer(undefined)).toMatchObject({ id: "", name: "", services: [], reviewList: [], available: true, kind: "lawyer" });
  });
});

describe("normService / normReview / normPromo", () => {
  it("prefers the selected price over the base price", () => {
    expect(normService({ service_id: "s", name: "N", selected_price: "70000", base_price: 50000 })).toMatchObject({ id: "s", price: 70000, basePrice: 50000 });
    expect(normService({ id: "s", base_price: 50000 }).price).toBe(50000);
  });
  it("reads a review from its payload", () => {
    expect(normReview({ id: "r", payload: { rating: 4, comment: " ok ", client_name: "Vali", rated_at: "2026-10-01" } })).toMatchObject({ rating: 4, comment: "ok", author: "Vali", createdAt: "2026-10-01" });
  });
  it("promo placement needs some target to open", () => {
    expect(hasPromoTarget(normPromo({ id: "p", seller_user_id: "u" }))).toBe(true);
    expect(hasPromoTarget(normPromo({ id: "p" }))).toBe(false);
    expect(normPromo({ seller_profile: { is_verified: true, rating: 4.5 } })).toMatchObject({ sellerVerified: true, sellerRating: 4.5 });
  });
});

describe("buildQuery", () => {
  it("always sends limit/offset and a server-known sort", () => {
    const q = new URLSearchParams(buildQuery({}, 20, 40));
    expect(q.get("limit")).toBe("20");
    expect(q.get("offset")).toBe("40");
    expect(q.get("sort")).toBe("recommended");
  });
  it("never sends sort=rating (the server answers 500) and maps filters", () => {
    const q = new URLSearchParams(buildQuery({ sort: "rating", kind: "advokat", region: "tashkent", area: "family", category: "c", service: "s", minRating: 4, maxPrice: 200000, q: "  ali " }, 10, 0));
    expect(q.get("sort")).toBe("recommended");
    expect(Object.fromEntries(q)).toMatchObject({ seller_type: "advokat", region: "tashkent", specialization: "family", category_id: "c", service_id: "s", min_rating: "4", price_max: "200000", q: "ali" });
    expect(new URLSearchParams(buildQuery({ kind: "all", q: "  " }, 1, 0)).has("seller_type")).toBe(false);
    expect(new URLSearchParams(buildQuery({ kind: "all", q: "  " }, 1, 0)).has("q")).toBe(false);
  });
  it("local mode for rating sort and min experience", () => {
    expect(isLocalMode({ sort: "rating" })).toBe(true);
    expect(isLocalMode({ minExp: 3 })).toBe(true);
    expect(isLocalMode({ sort: "price_asc" })).toBe(false);
  });
});

describe("activeFilterCount", () => {
  it("counts changed filters, not search or sort", () => {
    expect(activeFilterCount(defaultLawyerFilters)).toBe(0);
    expect(activeFilterCount({ ...defaultLawyerFilters, q: "x", sort: "rating", kind: "yurist", region: "r", minRating: 4 })).toBe(3);
  });
});

describe("getMyMatches", () => {
  it("reads GET /matching/me, caps the percentage and drops nameless rows", async () => {
    mockHttp.mockResolvedValueOnce({ items: [{ id: "m1", lawyer_user_id: "u1", name: "Ali", seller_type: "advokat", match_pct: 140.4, area: "family, labor", reason: "ok" }, { id: "m2", name: "" }, { lawyer_user_id: "u3", lawyer_name: "Vali", score: 87.6 }] });
    const rows = await getMyMatches();
    expect(mockHttp).toHaveBeenCalledWith("/matching/me");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ userId: "u1", kind: "advocate", pct: 100, area: "family, labor" });
    expect(rows[1]).toMatchObject({ userId: "u3", name: "Vali", pct: 88, kind: "lawyer" });
  });
  it("is empty for an empty answer", async () => {
    mockHttp.mockResolvedValueOnce(null);
    expect(await getMyMatches()).toEqual([]);
  });
});
