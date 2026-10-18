import { buildBody, normSharing, remainingPreset, shownAccuracy, untilMs, DEFAULT_POLICY } from "./sharing";

describe("buildBody", () => {
  it("stop body", () => expect(buildBody({ enabled: false })).toEqual({ enabled: false }));
  it("start body rounds accuracy", () => {
    expect(buildBody({ enabled: true, durationHours: 4, latitude: 41.3, longitude: 69.2, accuracyMeters: 34.6 })).toEqual({ enabled: true, duration_hours: 4, latitude: 41.3, longitude: 69.2, source: "foreground", accuracy_meters: 35 });
  });
  it("manual keeps null duration", () => expect(buildBody({ enabled: true, durationHours: null, latitude: 1, longitude: 2 }).duration_hours).toBeNull());
  it("rejects bad duration / coordinates", () => {
    expect(() => buildBody({ enabled: true, durationHours: 3, latitude: 1, longitude: 2 })).toThrow(RangeError);
    expect(() => buildBody({ enabled: true, durationHours: 1, latitude: NaN, longitude: 2 })).toThrow(RangeError);
  });
});

describe("normSharing", () => {
  it("empty → defaults", () => expect(normSharing(null)).toEqual({ enabled: false, durationHours: null, expiresAt: "", updatedAt: "", policy: DEFAULT_POLICY }));
  it("reads nested state and policy", () => {
    const r = normSharing({ location_sharing: { enabled: true, duration_hours: "4", active_until: "2030-01-01T00:00:00Z", last_seen_at: "x" }, policy: { foreground_update_interval_seconds: 120, retention_days: 7 } });
    expect(r).toMatchObject({ enabled: true, durationHours: 4, expiresAt: "2030-01-01T00:00:00Z", updatedAt: "x" });
    expect(r.policy).toEqual({ ...DEFAULT_POLICY, foregroundIntervalSec: 120, retentionDays: 7 });
  });
  it("status active counts as enabled", () => expect(normSharing({ state: { status: "ACTIVE" } }).enabled).toBe(true));
});

describe("timing helpers", () => {
  it("untilMs prefers a future server time", () => {
    expect(untilMs("2030-01-01T00:00:00Z", 1, 0)).toBe(Date.parse("2030-01-01T00:00:00Z"));
    expect(untilMs("", 2, 1000)).toBe(1000 + 7200_000);
    expect(untilMs("", null, 5)).toBeNull();
  });
  it("remainingPreset", () => {
    expect(remainingPreset(5 * 3600_000)).toBe(4);
    expect(remainingPreset(60_000)).toBe(1);
    expect(remainingPreset(13 * 3600_000)).toBe(12);
  });
  it("shownAccuracy", () => {
    expect(shownAccuracy(0.2)).toBe(1);
    expect(shownAccuracy(34.6)).toBe(35);
    expect(shownAccuracy(null)).toBeNull();
  });
});
