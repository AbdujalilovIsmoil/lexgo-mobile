import { lighten } from "./color";

describe("lighten", () => {
  it("mixes towards white", () => {
    expect(lighten("#000000", 1)).toBe("#ffffff");
    expect(lighten("#000000", 0)).toBe("#000000");
    expect(lighten("#1668f0", 0)).toBe("#1668f0");
  });
  it("keeps white white", () => {
    expect(lighten("#ffffff")).toBe("#ffffff");
  });
});
