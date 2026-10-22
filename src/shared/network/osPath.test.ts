import { describeOsPath, isDenied, type OsPath } from "./osPath";

jest.mock("expo-modules-core", () => ({ requireOptionalNativeModule: () => null }));

const p = (x: Partial<OsPath>): OsPath => ({ status: "unsatisfied", reason: "notAvailable", interfaces: [], ...x });

describe("isDenied", () => {
  it("the app's Mobile Data / Wireless Data switch off (iOS) or a per-app restriction (Android) is 'denied'", () => {
    expect(isDenied(p({ reason: "cellularDenied" }))).toBe(true);
    expect(isDenied(p({ reason: "wifiDenied" }))).toBe(true);
    expect(isDenied(p({ reason: "blocked" }))).toBe(true);
    expect(isDenied(p({ reason: "other", cellular: "restricted" }))).toBe(true);
  });
  it("no network at all, a satisfied path, or no module is not 'denied'", () => {
    expect(isDenied(p({ reason: "notAvailable" }))).toBe(false);
    expect(isDenied(p({ status: "satisfied", reason: "none", cellular: "restricted" }))).toBe(false);
    expect(isDenied(null)).toBe(false);
  });
});

describe("describeOsPath", () => {
  it("is one short line", () => {
    expect(describeOsPath(p({ reason: "cellularDenied", interfaces: ["cellular"], cellular: "restricted" }))).toBe("os: unsatisfied/cellularDenied [cellular] cell:restricted");
    expect(describeOsPath(p({ status: "satisfied", reason: "none", interfaces: ["wifi"], constrained: true }))).toBe("os: satisfied [wifi] low-data");
    expect(describeOsPath(null)).toBe("os: n/a");
  });
});
