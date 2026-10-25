import { gridColumns, remeasure } from "./useGrid";

// The module also holds the hook, whose tablet check imports expo-router; only the pure parts are tested here.
jest.mock("./useTablet", () => ({ useTablet: () => ({ tablet: true, docked: true, width: 1032, height: 1376 }) }));

describe("remeasure", () => {
  it("chooses the columns for the first width it sees", () => {
    expect(remeasure(null, 712, 0)).toEqual({ w: 712, dock: 0, basis: 712 });
  });
  it("keeps the columns' width when the docked sidebar opened or closed in between", () => {
    const open = remeasure(null, 712, 0);
    const closed = remeasure(open, 924, 1); // the sidebar closed: the page is 212 wider
    expect(closed).toEqual({ w: 924, dock: 1, basis: 712 });
    expect(remeasure(closed, 712, 2)).toEqual({ w: 712, dock: 2, basis: 712 }); // and opened again
  });
  it("chooses again when the width changed for another reason (the tablet turned)", () => {
    const closed = remeasure(remeasure(null, 712, 0), 924, 1);
    expect(remeasure(closed, 1268, 1)).toEqual({ w: 1268, dock: 1, basis: 1268 });
  });
  it("returns the same record when nothing changed", () => {
    const m = remeasure(null, 712, 3);
    expect(remeasure(m, 712, 3)).toBe(m);
  });
});

describe("gridColumns", () => {
  it("fits as many 280 dp cards as the room allows, never fewer than two", () => {
    expect(gridColumns(712)).toBe(2);
    expect(gridColumns(924)).toBe(3);
    expect(gridColumns(1268)).toBe(4);
    expect(gridColumns(300)).toBe(2);
  });
  it("never leaves one lonely card on the last row", () => {
    expect(gridColumns(924, { count: 4 })).toBe(2); // 3 + 1 → 2 + 2
    expect(gridColumns(1268, { count: 4 })).toBe(4);
    expect(gridColumns(924, { count: 5 })).toBe(3); // 3 + 2 is fine
  });
});
