import { ApiError } from "@/shared/api";
import { isRatingClosed } from "./rateApi";

describe("isRatingClosed", () => {
  it("is a state for rating_window_closed whatever the status", () => {
    expect(isRatingClosed(new ApiError(422, undefined, { code: "rating_window_closed" }))).toBe(true);
    expect(isRatingClosed(new ApiError(409, "x"))).toBe(true);
  });
  it("is not for other failures", () => {
    expect(isRatingClosed(new ApiError(500, "x"))).toBe(false);
    expect(isRatingClosed(new Error("x"))).toBe(false);
  });
});
