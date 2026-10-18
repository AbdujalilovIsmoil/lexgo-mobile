import { fitPicture } from "./fit";

describe("fitPicture", () => {
  it("is limited by the width of a tall box", () => expect(fitPicture(320, 900)).toEqual({ width: 320, height: 400 }));
  it("is limited by the height of a short box", () => expect(fitPicture(400, 300)).toEqual({ width: 240, height: 300 }));
  it("keeps the 4:5 ratio", () => {
    const r = fitPicture(361, 577);
    expect(r.height).toBe(Math.floor(r.width * 1.25));
    expect(r.width).toBeLessThanOrEqual(361);
    expect(r.height).toBeLessThanOrEqual(577);
  });
  it("is empty before the box is measured", () => expect(fitPicture(0, 500)).toEqual({ width: 0, height: 0 }));
});
