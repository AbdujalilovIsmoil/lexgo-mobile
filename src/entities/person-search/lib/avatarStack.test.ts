import { stackOverlap, stackPlan, stackWidth } from "./avatarStack";

describe("avatar stack", () => {
  it("shows everybody while they fit", () => {
    expect(stackPlan(0)).toEqual({ shown: 0, extra: 0 });
    expect(stackPlan(3)).toEqual({ shown: 3, extra: 0 });
    expect(stackPlan(5)).toEqual({ shown: 5, extra: 0 });
  });
  it("keeps one slot for the +N bubble when there are more", () => {
    expect(stackPlan(6)).toEqual({ shown: 4, extra: 2 });
    expect(stackPlan(20, 4)).toEqual({ shown: 3, extra: 17 });
  });
  it("is safe with odd input", () => {
    expect(stackPlan(-2)).toEqual({ shown: 0, extra: 0 });
    expect(stackPlan(3, 0)).toEqual({ shown: 0, extra: 3 });
  });
  it("width grows by size minus overlap per extra slot", () => {
    expect(stackWidth(0, 36)).toBe(0);
    expect(stackWidth(1, 36)).toBe(36);
    expect(stackWidth(3, 36)).toBe(36 + 2 * (36 - stackOverlap(36)));
  });
});
