import { ApiError, parseErrorBody } from "@/shared/api";
import { advertisingMode, isRetryable, promotionErrorCode } from "./errors";

describe("promotionErrorCode", () => {
  it("reads the code from code, detail.code, detail.error or detail", () => {
    expect(promotionErrorCode({ code: "service_id_required" })).toBe("service_id_required");
    expect(promotionErrorCode({ data: { detail: { code: "promotion_days_invalid" } } })).toBe("promotion_days_invalid");
    expect(promotionErrorCode({ data: { detail: { error: "promotion_placement_invalid" } } })).toBe("promotion_placement_invalid");
    expect(promotionErrorCode({ detail: " promotion_already_exists " })).toBe("promotion_already_exists");
  });
  it("knows the advertising gate (409) and the locale check (422) of the backend", () => {
    expect(promotionErrorCode(parseErrorBody(409, { detail: { code: "marketplace_advertising_not_active", mode: "test" } }))).toBe("marketplace_advertising_not_active");
    expect(promotionErrorCode(parseErrorBody(409, { detail: { code: "marketplace_advertising_not_ready" } }))).toBe("marketplace_advertising_not_ready");
    expect(promotionErrorCode(parseErrorBody(422, { detail: { code: "promotion_language_invalid" } }))).toBe("promotion_language_invalid");
  });
  it("ignores everything else", () => {
    expect(promotionErrorCode({ code: "other" })).toBe("");
    expect(promotionErrorCode(null)).toBe("");
    expect(promotionErrorCode("service_id_required")).toBe("");
    expect(promotionErrorCode(parseErrorBody(422, { detail: [{ loc: ["body", "days"], msg: "bad" }] }))).toBe("");
  });
});

describe("advertisingMode", () => {
  it("reads test / paused from detail.mode", () => {
    expect(advertisingMode(parseErrorBody(409, { detail: { code: "marketplace_advertising_not_active", mode: "test" } }))).toBe("test");
    expect(advertisingMode(parseErrorBody(409, { detail: { code: "marketplace_advertising_not_active", mode: " PAUSED " } }))).toBe("paused");
  });
  it("is empty for any other mode or answer", () => {
    expect(advertisingMode(parseErrorBody(409, { detail: { code: "marketplace_advertising_not_active", mode: "active" } }))).toBe("");
    expect(advertisingMode(parseErrorBody(409, { detail: { code: "marketplace_advertising_not_ready" } }))).toBe("");
    expect(advertisingMode(new ApiError(409, "x"))).toBe("");
    expect(advertisingMode(null)).toBe("");
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
