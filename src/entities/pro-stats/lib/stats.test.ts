import { deltaPct, fmtCount, fmtPct, isNewSeller, shares, sparkHeights, speedFill, starFills, sumPayouts, trendOf, val } from "./stats";

describe("formatting", () => {
  it("unknown is a dash, zero stays zero", () => {
    expect(fmtCount(undefined)).toBe("—");
    expect(fmtCount(0)).toBe("0");
    expect(val({ a: "5" }, "a")).toBe(5);
    expect(val({}, "a")).toBeUndefined();
    expect(val({ a: null }, "a")).toBeUndefined();
  });
  it("rates in 0..1 or 0..100", () => {
    expect(fmtPct(0.87)).toBe("87%");
    expect(fmtPct(92)).toBe("92%");
    expect(fmtPct(undefined)).toBe("—");
    expect(fmtPct(150)).toBe("100%");
  });
});

describe("delta and trend", () => {
  it("computes percent change", () => {
    expect(deltaPct(150, 100)).toBe(50);
    expect(deltaPct(50, 100)).toBe(-50);
    expect(deltaPct(10, 0)).toBeNull();
  });
  it("trend", () => {
    expect(trendOf(null)).toBeNull();
    expect(trendOf(3)).toBe("up");
    expect(trendOf(-3)).toBe("down");
    expect(trendOf(0)).toBe("flat");
  });
});

describe("bars", () => {
  it("spark heights are scaled with a floor", () => {
    expect(sparkHeights([0, 50, 100])).toEqual([0.08, 0.5, 1]);
    expect(sparkHeights([0, 0])).toEqual([0.08, 0.08]);
  });
  it("shares sum to 1", () => {
    const s = shares([1, 1, 2]);
    expect(s).toEqual([0.25, 0.25, 0.5]);
    expect(shares([0, 0])).toEqual([0, 0]);
  });
  it("speed fill", () => {
    expect(speedFill(10)).toBe(1);
    expect(speedFill(30)).toBe(0.5);
    expect(speedFill(0)).toBeUndefined();
    expect(speedFill(undefined)).toBeUndefined();
  });
  it("stars", () => {
    expect(starFills(4.5)).toEqual([1, 1, 1, 1, 0.5]);
    expect(starFills(0)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("payouts and empty detection", () => {
  it("sums paid vs waiting", () => {
    const rows = [{ amount: 100, status: "paid" }, { amount: 50, status: "pending" }, { amount: 25, status: "released" }];
    expect(sumPayouts(rows, true)).toBe(125);
    expect(sumPayouts(rows, false)).toBe(50);
  });
  const base = { workload: {}, finance: {}, performance: {}, payouts: 0, cases: 0, totalCases: 0 };
  it("detects a new seller", () => {
    expect(isNewSeller(base)).toBe(true);
    expect(isNewSeller({ ...base, workload: { active_cases: 0 } })).toBe(true);
    expect(isNewSeller({ ...base, workload: { active_cases: 2 } })).toBe(false);
    expect(isNewSeller({ ...base, payouts: 1 })).toBe(false);
  });
});
