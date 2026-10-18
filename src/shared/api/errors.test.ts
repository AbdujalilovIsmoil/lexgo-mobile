import { ApiError, isForbidden, isLimitError, isNetworkError, isUnauthorized, parseErrorBody } from "./errors";

describe("parseErrorBody", () => {
  it("reads a string detail", () => {
    const e = parseErrorBody(400, { detail: "Xato" });
    expect(e.status).toBe(400);
    expect(e.detail).toBe("Xato");
  });
  it("collects 422 field errors", () => {
    const e = parseErrorBody(422, { detail: [{ loc: ["body", "phone"], msg: "bad phone" }] });
    expect(e.fieldErrors).toEqual({ phone: "bad phone" });
    expect(e.detail).toBe("bad phone");
  });
  it("reads message and code from an object detail", () => {
    const e = parseErrorBody(403, { detail: { message: "no", code: "forbidden_role" } });
    expect(e.detail).toBe("no");
    expect(e.code).toBe("forbidden_role");
  });
  it("takes Retry-After from the header", () => {
    expect(parseErrorBody(429, {}, "30").retryAfter).toBe(30);
    expect(parseErrorBody(429, {}, null).retryAfter).toBeUndefined();
  });
});

describe("error predicates", () => {
  it("match by status", () => {
    expect(isUnauthorized(new ApiError(401))).toBe(true);
    expect(isForbidden(new ApiError(401))).toBe(false);
    expect(isNetworkError(new ApiError(0, "network_error"))).toBe(true);
    expect(isUnauthorized(new Error("x"))).toBe(false);
  });
  it("treats limits, payment and rate errors as limit errors", () => {
    expect(isLimitError(new ApiError(402))).toBe(true);
    expect(isLimitError(new ApiError(400, "kunlik limit tugadi"))).toBe(true);
    expect(isLimitError(new ApiError(404))).toBe(false);
  });
});
