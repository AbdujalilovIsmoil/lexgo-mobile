import { barsOf, countBars, perDay } from "./charts";

describe("attention chart helpers", () => {
  it("sums values per day, oldest first", () => {
    const pts = perDay([{ d: "2026-10-02T10:00" }, { d: "2026-10-01T09:00" }, { d: "2026-10-02T12:00" }, { d: "" }], (x) => x.d);
    expect(pts).toEqual([{ label: "2026-10-01", value: 1 }, { label: "2026-10-02", value: 2 }]);
  });
  it("uses a custom value", () => {
    expect(perDay([{ d: "2026-10-01", n: 5 }, { d: "2026-10-01", n: 7 }], (x) => x.d, (x) => x.n)).toEqual([{ label: "2026-10-01", value: 12 }]);
  });
  it("counts per key, biggest first", () => {
    const s = countBars("t", ["a", "b", "a", ""], (x) => x, (k) => k.toUpperCase());
    expect(s).toMatchObject({ kind: "bars", rows: [{ label: "A", n: 2 }, { label: "B", n: 1 }, { label: "—", n: 1 }] });
  });
  it("turns plain rows into bars", () => {
    expect(barsOf("x", [{ label: "L", n: 3, text: "3 ta" }])).toEqual({ kind: "bars", title: "x", rows: [{ label: "L", value: "3 ta", n: 3 }] });
  });
});
