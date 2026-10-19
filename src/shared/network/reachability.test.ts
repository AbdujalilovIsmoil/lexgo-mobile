import { verdictOf } from "./reachability";

describe("network verdict", () => {
  it("no interface is offline at once", () => {
    expect(verdictOf({ isConnected: false, isInternetReachable: false })).toBe("offline");
    expect(verdictOf({ isConnected: true, type: "NONE" })).toBe("offline");
  });
  it("connected but 'unreachable' must be verified against our API (emulator, captive-portal check)", () => {
    expect(verdictOf({ isConnected: true, isInternetReachable: false })).toBe("verify");
  });
  it("unknown values are not offline", () => {
    expect(verdictOf({})).toBe("online");
    expect(verdictOf({ isConnected: true, isInternetReachable: undefined })).toBe("online");
    expect(verdictOf({ isConnected: true, isInternetReachable: true })).toBe("online");
  });
});
