import { activeSince, promoPeriod } from "./period";
import { progressOf } from "./progress";
import { isRunning } from "./settle";

describe("progressOf", () => {
  const a = "2026-10-18T00:00:00Z";
  const b = "2026-10-25T00:00:00Z";
  it("is the elapsed share", () => expect(progressOf(a, b, Date.parse("2026-10-21T12:00:00Z"))).toBeCloseTo(0.5));
  it("is clamped", () => {
    expect(progressOf(a, b, Date.parse("2026-10-01T00:00:00Z"))).toBe(0);
    expect(progressOf(a, b, Date.parse("2026-11-01T00:00:00Z"))).toBe(1);
  });
  it("is 0 without usable dates", () => {
    expect(progressOf("", b)).toBe(0);
    expect(progressOf(b, a)).toBe(0);
  });
});

describe("isRunning", () => {
  const T = Date.parse("2026-10-18T20:00:00Z");
  const started = "2026-10-18T20:22:59+00:00";
  const run = [{ placement: "service_boost" as const, serviceId: "s1", startsAt: started }, { placement: "banner" as const, serviceId: "", startsAt: started }];
  it("matches a service request by its service", () => {
    expect(isRunning({ target: "service:s1", at: T }, run)).toBe(true);
    expect(isRunning({ target: "service:s2", at: T }, run)).toBe(false);
  });
  it("matches a profile or banner request by placement", () => {
    expect(isRunning({ target: "banner", at: T }, run)).toBe(true);
    expect(isRunning({ target: "profile_boost", at: T }, run)).toBe(false);
  });
  it("ignores a promotion that started before the request", () => expect(isRunning({ target: "banner", at: Date.parse("2026-10-20T00:00:00Z") }, run)).toBe(false));
});

describe("promotion period", () => {
  it("starts at the oldest running promotion", () => expect(activeSince([{ startsAt: "2026-10-20T01:00:00+00:00" }, { startsAt: "2026-10-18T20:22:59+00:00" }, { startsAt: "" }])).toBe("2026-10-18"));
  it("is empty when nothing runs", () => expect(activeSince([])).toBe(""));
  it("runs to today", () => expect(promoPeriod("2026-10-18", "2026-10-19")).toEqual({ from: "2026-10-18", to: "2026-10-19" }));
  it("is cut to 90 days", () => expect(promoPeriod("2025-01-01", "2026-10-19").from).toBe("2026-07-22"));
});
