import { mapInChunks } from "./yieldWork";

jest.mock("react-native", () => ({ InteractionManager: { runAfterInteractions: (f: () => void) => f() } }));

describe("mapInChunks", () => {
  it("keeps order and yields when the slice budget is used", async () => {
    let t = 0;
    const out = await mapInChunks([1, 2, 3, 4, 5], (n) => n * 2, { budgetMs: 2, now: () => (t += 1) });
    expect(out).toEqual([2, 4, 6, 8, 10]);
  });
  it("stops early on request", async () => {
    let seen = 0;
    const out = await mapInChunks([1, 2, 3, 4], (n) => n, { shouldStop: () => seen++ >= 2 });
    expect(out).toEqual([1, 2]);
  });
});
