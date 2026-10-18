import { matchPeriod, periodRange, spanDays } from "./presets";
import { rangeError } from "./range";

describe("quick periods", () => {
  it("count today as the last day", () => expect(periodRange(7, "2026-10-18")).toEqual({ from: "2026-10-12", to: "2026-10-18" }));
  it("cross month and year ends", () => expect(periodRange(14, "2026-01-05")).toEqual({ from: "2025-12-23", to: "2026-01-05" }));
  it("stay inside the 90-day rule", () => {
    const r = periodRange(90, "2026-10-18");
    expect(rangeError(r.from, r.to)).toBeNull();
    expect(spanDays(r.from, r.to)).toBe(90);
  });
  it("are recognised from their dates", () => {
    const r = periodRange(30, "2026-10-18");
    expect(matchPeriod(r.from, r.to, "2026-10-18")).toBe(30);
    expect(matchPeriod("2026-10-01", "2026-10-18", "2026-10-18")).toBeNull();
    expect(matchPeriod("", "", "2026-10-18")).toBeNull();
  });
});

describe("spanDays", () => {
  it("counts both ends", () => expect(spanDays("2026-10-12", "2026-10-18")).toBe(7));
  it("is 0 for an open or reversed range", () => {
    expect(spanDays("", "2026-10-18")).toBe(0);
    expect(spanDays("2026-10-19", "2026-10-18")).toBe(0);
  });
});
