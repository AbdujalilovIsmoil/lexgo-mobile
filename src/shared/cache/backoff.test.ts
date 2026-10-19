import { backoffMs, flushVerdict, idempotencyKey, isPermanentStatus } from "./backoff";

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

describe("outbox failure verdict", () => {
  it("no answer (offline / timeout) stops the run without counting an attempt", () => {
    expect(flushVerdict(0, 0)).toBe("stop");
    expect(flushVerdict(0, 7)).toBe("stop");
  });
  it("401: waits for the account when signed out, otherwise counts one attempt and ends the run", () => {
    expect(flushVerdict(401, 0, 8, false)).toBe("stop");
    expect(flushVerdict(401, 0, 8, true)).toBe("retry-stop");
    expect(flushVerdict(401, 7, 8, true)).toBe("drop");
  });
  it("rejected writes are dropped, transient ones retried until the attempt cap", () => {
    expect(flushVerdict(422, 0)).toBe("drop");
    expect(flushVerdict(404, 0)).toBe("drop");
    expect(flushVerdict(503, 0)).toBe("retry");
    expect(flushVerdict(429, 3)).toBe("retry");
    expect(flushVerdict(503, 7, 8)).toBe("drop");
    expect(flushVerdict(-1, 0)).toBe("retry");
  });
});
