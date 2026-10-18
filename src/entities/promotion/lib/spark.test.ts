import { sparkBars } from "./spark";

describe("sparkBars", () => {
  it("scales to the tallest value", () => expect(sparkBars([0, 5, 10], 40)).toEqual([3, 20, 40]));
  it("keeps a flat line for no data", () => expect(sparkBars([0, 0], 40)).toEqual([3, 3]));
  it("is empty for an empty series", () => expect(sparkBars([], 40)).toEqual([]));
});
