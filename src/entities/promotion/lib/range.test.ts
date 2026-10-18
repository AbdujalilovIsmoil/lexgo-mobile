import { rangeError } from "./range";

describe("rangeError", () => {
  it("accepts an open or ordered range", () => {
    expect(rangeError("", "")).toBeNull();
    expect(rangeError("2026-01-01", "")).toBeNull();
    expect(rangeError("2026-01-01", "2026-01-01")).toBeNull();
  });
  it("rejects start after end", () => expect(rangeError("2026-02-01", "2026-01-01")).toBe("order"));
  it("rejects a span over 90 days", () => {
    expect(rangeError("2026-01-01", "2026-04-01")).toBeNull(); // 90 days
    expect(rangeError("2026-01-01", "2026-04-02")).toBe("long");
  });
});
