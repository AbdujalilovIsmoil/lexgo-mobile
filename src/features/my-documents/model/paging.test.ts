import { PAGE, growWindow, nextCount, pageInfo } from "./pageWindow";
import { filterChips } from "./filterChips";

describe("page window", () => {
  it("shows ten at a time and never claims fewer than loaded", () => {
    expect(PAGE).toBe(10);
    expect(pageInfo(10, 37)).toEqual({ loaded: 10, total: 37, more: true });
    expect(pageInfo(37, 37).more).toBe(false);
    expect(pageInfo(12, 5)).toEqual({ loaded: 12, total: 12, more: false });
  });
  it("grows by a page, capped at the total", () => {
    expect(growWindow(10, 37)).toBe(20);
    expect(growWindow(30, 37)).toBe(37);
    expect(growWindow(10, 3)).toBe(10);
  });
  it("counts what the next press adds", () => {
    expect(nextCount(10, 37)).toBe(10);
    expect(nextCount(30, 37)).toBe(7);
    expect(nextCount(37, 37)).toBe(0);
  });
});

describe("filterChips", () => {
  const names = { mode: (m: string) => `m:${m}`, status: (s: string) => `s:${s}` };
  it("lists only the active filters", () => {
    expect(filterChips({ mode: "", status: "" }, names)).toEqual([]);
    expect(filterChips({ mode: "ai", status: "draft" }, names)).toEqual([{ key: "mode", label: "m:ai" }, { key: "status", label: "s:draft" }]);
  });
});
