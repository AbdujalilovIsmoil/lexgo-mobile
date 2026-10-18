import { canLeave, stepsFor, visibleStep } from "./steps";

const gate = { placement: true, needsService: false, hasService: false, hasPackage: true, bannerBlocked: false, ready: true };

describe("wizard steps", () => {
  it("has a banner step only for packages that take a picture", () => {
    expect(stepsFor(true)).toEqual(["place", "package", "banner", "confirm"]);
    expect(stepsFor(false)).toEqual(["place", "package", "confirm"]);
  });
  it("needs a service before leaving the first step of a service promotion", () => {
    expect(canLeave("place", { ...gate, needsService: true })).toBe(false);
    expect(canLeave("place", { ...gate, needsService: true, hasService: true })).toBe(true);
  });
  it("needs a package, a passable banner and a ready request", () => {
    expect(canLeave("package", { ...gate, hasPackage: false })).toBe(false);
    expect(canLeave("banner", { ...gate, bannerBlocked: true })).toBe(false);
    expect(canLeave("confirm", { ...gate, ready: false })).toBe(false);
    expect(canLeave("confirm", gate)).toBe(true);
  });
  it("falls back when the banner step is gone", () => expect(visibleStep(stepsFor(false), "banner")).toBe("package"));
});
