import { isRetryable, promotionErrorCode } from "./errors";

describe("promotionErrorCode", () => {
  it("reads the code from code, detail.code, detail.error or detail", () => {
    expect(promotionErrorCode({ code: "service_id_required" })).toBe("service_id_required");
    expect(promotionErrorCode({ data: { detail: { code: "promotion_days_invalid" } } })).toBe("promotion_days_invalid");
    expect(promotionErrorCode({ data: { detail: { error: "promotion_placement_invalid" } } })).toBe("promotion_placement_invalid");
    expect(promotionErrorCode({ detail: " promotion_already_exists " })).toBe("promotion_already_exists");
  });
  it("ignores everything else", () => {
    expect(promotionErrorCode({ code: "other" })).toBe("");
    expect(promotionErrorCode(null)).toBe("");
    expect(promotionErrorCode("service_id_required")).toBe("");
  });
});

describe("isRetryable", () => {
  it("retries network, 5xx, 408 and 429 only", () => {
    expect(isRetryable({ status: 0 })).toBe(true);
    expect(isRetryable({ status: 503 })).toBe(true);
    expect(isRetryable({ status: 429 })).toBe(true);
    expect(isRetryable({ status: 409 })).toBe(false);
    expect(isRetryable({ status: 422 })).toBe(false);
    expect(isRetryable(new Error("x"))).toBe(true);
  });
});
