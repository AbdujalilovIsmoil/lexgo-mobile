import { chosenPackage, popularId } from "./packages";

const ids = (...a: string[]) => a.map((id) => ({ id }));

describe("popular package", () => {
  it("is the middle of three or more", () => {
    expect(popularId(ids("a", "b", "c"))).toBe("b");
    expect(popularId(ids("a", "b", "c", "d"))).toBe("b");
  });
  it("is the last of fewer, empty for none", () => {
    expect(popularId(ids("a", "b"))).toBe("b");
    expect(popularId([])).toBe("");
  });
  it("is chosen until the seller picks another", () => {
    expect(chosenPackage(ids("a", "b", "c"), "")?.id).toBe("b");
    expect(chosenPackage(ids("a", "b", "c"), "c")?.id).toBe("c");
    expect(chosenPackage(ids("a", "b", "c"), "gone")?.id).toBe("b");
    expect(chosenPackage([], "x")).toBeNull();
  });
});
