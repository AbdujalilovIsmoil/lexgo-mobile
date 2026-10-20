import { fitSnaps } from "./fitSnaps";

describe("fitSnaps", () => {
  it("keeps the snaps while the content is unmeasured", () => {
    expect(fitSnaps([400, 800], null, 900)).toEqual([400, 800]);
  });
  it("hugs short content with one snap", () => {
    expect(fitSnaps([400, 800], 250, 900)).toEqual([250]);
  });
  it("caps the top snap to the content for medium content", () => {
    expect(fitSnaps([400, 800], 600, 900)).toEqual([400, 600]);
  });
  it("never exceeds the available room", () => {
    expect(fitSnaps([400, 1200], 2000, 900)).toEqual([400, 900]);
  });
  it("keeps the top snap reachable for an expandable sheet", () => {
    expect(fitSnaps([400, 800], 250, 900, true)).toEqual([250, 800]);
    expect(fitSnaps([400, 800], 600, 900, true)).toEqual([400, 800]);
    expect(fitSnaps([400, 800], 790, 900, true)).toEqual([400, 800]);
  });
  it("an expandable sheet with no room to pull stays on one snap", () => {
    expect(fitSnaps([780, 800], 790, 900, true)).toEqual([800]);
  });
});
