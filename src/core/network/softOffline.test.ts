import { ApiError } from "@/shared/api";
import { isSoftFailure } from "./softOffline";

describe("soft offline failures", () => {
  it("softens only network failures that still have data", () => {
    expect(isSoftFailure(new ApiError(0, "network_error"), true)).toBe(true);
    expect(isSoftFailure(new ApiError(0, "network_error"), false)).toBe(false);
    expect(isSoftFailure(new ApiError(500), true)).toBe(false);
    expect(isSoftFailure(new ApiError(403), true)).toBe(false);
    expect(isSoftFailure(new Error("x"), true)).toBe(false);
  });
});
