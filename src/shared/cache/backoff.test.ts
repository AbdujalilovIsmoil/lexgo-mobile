import { backoffMs, idempotencyKey, isPermanentStatus } from "./backoff";

describe("outbox backoff", () => {
  it("grows and caps at 5 minutes", () => {
    const zero = () => 0;
    expect([1, 2, 3, 4, 5, 6, 20].map((n) => backoffMs(n, zero))).toEqual([5000, 15000, 45000, 120000, 300000, 300000, 300000]);
  });
  it("adds at most 20% jitter", () => {
    expect(backoffMs(1, () => 1)).toBe(6000);
  });
  it("treats 0 attempts as the first step", () => {
    expect(backoffMs(0, () => 0)).toBe(5000);
  });
});

describe("outbox retry policy", () => {
  it("drops client errors, keeps auth/timeout/rate-limit/5xx retryable", () => {
    expect([400, 403, 404, 409, 422].every(isPermanentStatus)).toBe(true);
    expect([401, 408, 429, 500, 502, 503, 0].some(isPermanentStatus)).toBe(false);
  });
  it("idempotency key is stable per item", () => {
    expect(idempotencyKey("u1", "task.create", 7, 99)).toBe(idempotencyKey("u1", "task.create", 7, 99));
    expect(idempotencyKey("u1", "task.create", 7, 99)).not.toBe(idempotencyKey("u1", "task.create", 8, 99));
  });
});
