import { ApiError } from "@/shared/api";
import { isOfflineStall, isSoftFailure } from "./softOffline";

jest.mock("@/shared/cache", () => ({ whenRestored: () => Promise.resolve() }));

describe("soft offline failures", () => {
  it("softens only network failures that still have data", () => {
    expect(isSoftFailure(new ApiError(0, "network_error"), true)).toBe(true);
    expect(isSoftFailure(new ApiError(0, "network_error"), false)).toBe(false);
    expect(isSoftFailure(new ApiError(500), true)).toBe(false);
    expect(isSoftFailure(new ApiError(403), true)).toBe(false);
    expect(isSoftFailure(new Error("x"), true)).toBe(false);
  });
});

describe("first load stalled offline", () => {
  const paused = { status: "pending", data: undefined, fetchStatus: "paused", fetchFailureReason: new ApiError(0, "network_error") };
  it("is a stall when nothing is shown and the fetch paused for the network", () => {
    expect(isOfflineStall(paused, false)).toBe(true);
    expect(isOfflineStall(paused, true)).toBe(true); // reported online, but the request never got an answer
    expect(isOfflineStall({ ...paused, fetchFailureReason: null }, false)).toBe(true); // paused before the first attempt
  });
  it("is not a stall with data, while fetching, after a server error or when only the app focus paused it", () => {
    expect(isOfflineStall({ ...paused, data: [] }, false)).toBe(false);
    expect(isOfflineStall({ ...paused, fetchStatus: "fetching" }, false)).toBe(false);
    expect(isOfflineStall({ ...paused, status: "error" }, false)).toBe(false);
    expect(isOfflineStall({ ...paused, fetchFailureReason: new ApiError(500) }, true)).toBe(false);
  });
});
