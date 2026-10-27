import { bandLine, canEdit, canPromote, countBy, filterServices, hiddenReasons, isCapped, priceGauge, priceIssue, visibilityChecks } from "./rules";
import type { ProService } from "../model/types";

const band = { recommended: 100, min: 70, max: 100, base: null, currency: "UZS", modifiers: null };
const svc = (o: Partial<ProService> = {}): ProService => ({ id: "1", name: "Divorce", categoryTitle: "Family", subcategory: "", catalogPrice: 100, catalogActive: true, advokatRequired: false, status: "active", selectedPrice: 0, effectivePrice: 100, priceCapped: false, note: "", visible: true, promotion: null, profileBoost: null, limits: band, negotiationAllowed: null, rulesPending: false, ...o });
const promo = { id: "p", serviceId: "1", packageTitle: "", daysLeft: 3, endsAt: "" };

describe("seller service price (TZ 5.1)", () => {
  it("a lower price is allowed, a price above the backend maximum is not", () => {
    expect(priceIssue(50, band)).toBeNull();
    expect(priceIssue(100, band)).toBeNull();
    expect(priceIssue(101, band)).toBe("high");
  });
  it("nothing to check without a band or a price", () => {
    expect(priceIssue(500, null)).toBeNull();
    expect(priceIssue(0, band)).toBeNull();
  });
});

describe("why a service is hidden (web hiddenReasons)", () => {
  it("visible services have no reasons", () => expect(hiddenReasons(svc(), true)).toEqual([]));
  it("lists every cause, in the web order", () => {
    expect(hiddenReasons(svc({ visible: false, catalogActive: false, status: "paused", effectivePrice: 0 }), false)).toEqual(["catalogOff", "paused", "noPrice", "unverified"]);
    expect(hiddenReasons(svc({ visible: false, status: "inactive" }), true)).toEqual(["inactive"]);
  });
  it("falls back to 'other' when nothing explains it", () => expect(hiddenReasons(svc({ visible: false }), true)).toEqual(["other"]));
});

describe("capped price and corridor line", () => {
  it("capped when the server says so or the chosen price is above the maximum", () => {
    expect(isCapped(svc())).toBe(false);
    expect(isCapped(svc({ priceCapped: true }))).toBe(true);
    expect(isCapped(svc({ selectedPrice: 150 }))).toBe(true);
    expect(isCapped(svc({ selectedPrice: 100 }))).toBe(false);
  });
  it("picks the corridor line", () => {
    expect(bandLine(svc())).toBe("ok");
    expect(bandLine(svc({ selectedPrice: 150 }))).toBe("off");
    expect(bandLine(svc({ limits: null }))).toBe("unknown");
    expect(bandLine(svc({ limits: null, catalogPrice: 0, effectivePrice: 0 }))).toBe("none");
  });
});

describe("actions and list", () => {
  it("promote needs an active, catalogue-active service with nothing promoted or pending", () => {
    expect(canPromote(svc(), false)).toBe(true);
    expect(canPromote(svc({ status: "paused" }), false)).toBe(false);
    expect(canPromote(svc({ catalogActive: false }), false)).toBe(false);
    expect(canPromote(svc({ promotion: promo }), false)).toBe(false);
    expect(canPromote(svc(), true)).toBe(false);
    expect(canEdit(svc({ catalogActive: false }))).toBe(false);
  });
  const all = [svc({ id: "a", name: "Zeta", status: "inactive" }), svc({ id: "b", name: "Beta", status: "paused", promotion: promo }), svc({ id: "c", name: "Alpha", note: "inheritance" })];
  it("counts per status and promoted", () => expect(countBy(all)).toEqual({ all: 3, active: 1, paused: 1, inactive: 1, promoted: 1 }));
  it("filters by status, searches name/category/note and sorts active first", () => {
    expect(filterServices(all, "all", "").map((x) => x.id)).toEqual(["c", "b", "a"]);
    expect(filterServices(all, "paused", "").map((x) => x.id)).toEqual(["b"]);
    expect(filterServices(all, "all", " INHERIT ").map((x) => x.id)).toEqual(["c"]);
    expect(filterServices(all, "active", "zeta")).toEqual([]);
  });
});

describe("visibility checks and price gauge", () => {
  const item = { status: "active", catalogActive: true, effectivePrice: 200, selectedPrice: 200, limits: { min: 100, max: 300, recommended: 250, base: null, currency: "UZS", modifiers: null } } as unknown as ProService;
  it("lists the four listing conditions", () => {
    expect(visibilityChecks(item, true).every((c) => c.ok)).toBe(true);
    const bad = visibilityChecks({ ...item, status: "paused", effectivePrice: 0 } as ProService, false);
    expect(bad.filter((c) => !c.ok).map((c) => c.key)).toEqual(["active", "price", "verified"]);
  });
  it("places the price along the corridor and flags one above it", () => {
    expect(priceGauge(item)).toMatchObject({ at: 0.5, over: false, recommended: 250 });
    expect(priceGauge({ ...item, effectivePrice: 400 } as ProService)).toMatchObject({ at: 1, over: true });
    expect(priceGauge({ ...item, limits: null } as ProService)).toBeNull();
  });
});
