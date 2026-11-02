import { BG_OFF, bgIntervalMs, decideBackground } from "./background";

const now = Date.parse("2026-11-02T10:00:00Z");
describe("seller background location", () => {
  it("never sends when sharing is off or background was not allowed", () => {
    expect(decideBackground(BG_OFF, now)).toEqual({ kind: "stop", expired: false });
    expect(decideBackground({ enabled: true, background: false, until: null, manual: true }, now)).toEqual({ kind: "stop", expired: false });
  });
  it("stops (and tells the server) once a timed share has ended", () => {
    expect(decideBackground({ enabled: true, background: true, until: now - 1, manual: false }, now)).toEqual({ kind: "stop", expired: true });
  });
  it("sends with the duration preset that still fits", () => {
    expect(decideBackground({ enabled: true, background: true, until: now + 5 * 3600_000, manual: false }, now)).toEqual({ kind: "send", durationHours: 4 });
    expect(decideBackground({ enabled: true, background: true, until: now + 30 * 60_000, manual: false }, now)).toEqual({ kind: "send", durationHours: 1 });
  });
  it("an until-switched-off share keeps no duration", () => {
    expect(decideBackground({ enabled: true, background: true, until: null, manual: true }, now)).toEqual({ kind: "send", durationHours: null });
  });
  it("wakes up at the backend's background interval, never more often than a minute", () => {
    expect(bgIntervalMs(600)).toBe(600_000);
    expect(bgIntervalMs(10)).toBe(60_000);
    expect(bgIntervalMs(0)).toBe(600_000);
  });
});
