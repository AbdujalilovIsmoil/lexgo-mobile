import { agoOf, cutText, flowCounts, isLate, stepsOf, summaryOf } from "./listLogic";
import type { DocReq } from "../model/types";

const NOW = Date.parse("2026-10-10T12:00:00Z");
const d = (p: Partial<DocReq>) => ({ status: "claimed", createdAt: "2026-10-10T11:00:00Z", flow: "", ...p }) as DocReq;

describe("agoOf", () => {
  it("picks the unit", () => {
    expect(agoOf("2026-10-10T11:59:50Z", NOW)).toEqual({ unit: "now", n: 0 });
    expect(agoOf("2026-10-10T11:15:00Z", NOW)).toEqual({ unit: "min", n: 45 });
    expect(agoOf("2026-10-10T09:00:00Z", NOW)).toEqual({ unit: "hour", n: 3 });
    expect(agoOf("2026-10-07T12:00:00Z", NOW)).toEqual({ unit: "day", n: 3 });
    expect(agoOf("", NOW)).toBeNull();
    expect(agoOf("2026-10-11T00:00:00Z", NOW)).toBeNull();
  });
});

describe("isLate", () => {
  it("is late only when open and older than 24 h", () => {
    expect(isLate(d({ createdAt: "2026-10-08T12:00:00Z" }), NOW)).toBe(true);
    expect(isLate(d({}), NOW)).toBe(false);
    expect(isLate(d({ status: "completed", createdAt: "2026-10-01T12:00:00Z" }), NOW)).toBe(false);
  });
});

describe("summary, counts, steps, text", () => {
  it("builds the three tiles from tab counts", () => {
    expect(summaryOf({ claimed: 4, new: 2, completed: 9 }).map((t) => [t.tab, t.n])).toEqual([["claimed", 4], ["new", 2], ["completed", 9]]);
    expect(summaryOf({}).every((t) => t.n === 0)).toBe(true);
  });
  it("counts work types", () => {
    expect(flowCounts([d({ flow: "a" }), d({ flow: "a" }), d({ flow: "b" })])).toEqual({ all: 3, a: 2, b: 1 });
  });
  it("places the request on the steps", () => {
    expect(stepsOf("new").map((s) => s.state)).toEqual(["now", "todo", "todo"]);
    expect(stepsOf("claimed").map((s) => s.state)).toEqual(["done", "now", "todo"]);
    expect(stepsOf("completed").map((s) => s.state)).toEqual(["done", "done", "done"]);
    expect(stepsOf("rejected")[1].state).toBe("fail");
  });
  it("cuts long text", () => {
    expect(cutText("short")).toEqual({ text: "short", cut: false });
    const r = cutText("x".repeat(300), 100);
    expect(r.cut).toBe(true);
    expect(r.text.length).toBeLessThanOrEqual(100);
  });
});
