import { planRestore, type KeyRow } from "./restorePlan";

const row = (key: unknown[], bytes = 1000, updatedAt = 1): KeyRow => ({ key: `rq:${JSON.stringify(key)}`, bytes, updatedAt });
const none = () => false;

describe("start-up restore plan", () => {
  it("keeps allowed snapshots in the given (newest first) order and drops denied or unknown ones", () => {
    const plan = planRestore([row(["pro-tasks"]), row(["secure-chat", "messages", "r1"]), row(["something-new"]), row(["notifications", "list"])], "rq:", none).flat();
    expect(plan.map((x) => x.key)).toEqual([["pro-tasks"], ["notifications", "list"]]);
  });

  it("skips queries that already have data in memory and rows that are not snapshots", () => {
    const plan = planRestore([row(["pro-tasks"]), row(["pro-cases", "list"]), { key: "draft:x", bytes: 10, updatedAt: 1 }, { key: "rq:{broken", bytes: 10, updatedAt: 1 }], "rq:", (k) => k[0] === "pro-tasks").flat();
    expect(plan.map((x) => x.key)).toEqual([["pro-cases", "list"]]);
  });

  it("respects the row and byte budgets and cuts small slices", () => {
    const rows = Array.from({ length: 30 }, (_, i) => row(["pro-cases", "detail", String(i)], 100_000));
    const slices = planRestore(rows, "rq:", none, { rows: 20, bytes: 1_500_000, sliceBytes: 250_000, sliceRows: 8 });
    const all = slices.flat();
    expect(all).toHaveLength(15); // 15 × 100 KB fits the 1.5 MB budget
    expect(slices.every((s) => s.reduce((n, x) => n + x.bytes, 0) <= 250_000)).toBe(true);
    expect(slices.every((s) => s.length <= 8)).toBe(true);
  });

  it("a single oversized snapshot does not block smaller ones", () => {
    const plan = planRestore([row(["pro-tasks"], 5_000_000), row(["pro-cases", "list"], 1000)], "rq:", none, { rows: 10, bytes: 1_000_000, sliceBytes: 200_000, sliceRows: 8 }).flat();
    expect(plan.map((x) => x.key)).toEqual([["pro-cases", "list"]]);
  });
});
