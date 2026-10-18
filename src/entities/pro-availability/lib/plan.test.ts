import type { WeeklyDay } from "../model/types";
import { applyPreset, barGeometry, clockIn, copyToAll, openState, presetOf, rangeValid, stepTime, withPart } from "./plan";
import { issuesOf } from "./time";

const week = (): WeeklyDay[] => Array.from({ length: 7 }, (_, day) => ({ day, enabled: day < 6, start: "09:00", end: "19:00" }));

describe("presets", () => {
  it("work = Mon-Fri 09-18, weekend off", () => {
    const w = applyPreset(week(), "work");
    expect(w.filter((d) => d.enabled).map((d) => d.day)).toEqual([0, 1, 2, 3, 4]);
    expect(w[0]).toMatchObject({ start: "09:00", end: "18:00" });
    expect(presetOf(w)).toBe("work");
  });
  it("daily, full and clear", () => {
    expect(applyPreset(week(), "daily").every((d) => d.enabled && d.end === "18:00")).toBe(true);
    const full = applyPreset(week(), "full");
    expect(full[3]).toMatchObject({ start: "00:00", end: "23:59" });
    expect(issuesOf({ timezone: "", weekly: full, exceptions: [], deadlines: { manual: 30, auto: 15, sos: 5 }, source: "custom" })).toEqual([]);
    const none = applyPreset(week(), "clear");
    expect(none.some((d) => d.enabled)).toBe(false);
    expect(presetOf(week())).toBeNull();
  });
});

describe("copyToAll", () => {
  it("copies an open day to every day and enables them", () => {
    const w = week();
    w[2] = { day: 2, enabled: true, start: "10:00", end: "15:30" };
    const out = copyToAll(w, 2);
    expect(out.every((d) => d.enabled && d.start === "10:00" && d.end === "15:30")).toBe(true);
  });
  it("ignores a closed source day", () => {
    const w = week();
    expect(copyToAll(w, 6)).toBe(w);
  });
});

describe("ranges and steps", () => {
  it("validates ranges", () => {
    expect(rangeValid("09:00", "18:00")).toBe(true);
    expect(rangeValid("18:00", "09:00")).toBe(false);
    expect(rangeValid("09:00", "09:00")).toBe(false);
  });
  it("steps and clamps", () => {
    expect(stepTime("09:00", 15)).toBe("09:15");
    expect(stepTime("09:00", -15)).toBe("08:45");
    expect(stepTime("00:00", -5)).toBe("00:00");
    expect(stepTime("23:55", 15)).toBe("23:59");
    expect(withPart("09:30", "h", 14)).toBe("14:30");
    expect(withPart("09:30", "m", 5)).toBe("09:05");
  });
});

describe("barGeometry", () => {
  it("maps a range onto 24 h", () => {
    expect(barGeometry("06:00", "18:00")).toEqual({ left: 0.25, width: 0.5 });
    expect(barGeometry("00:00", "23:59")?.width).toBeCloseTo(1, 2);
  });
  it("is null for an invalid range", () => {
    expect(barGeometry("18:00", "09:00")).toBeNull();
    expect(barGeometry("xx", "09:00")).toBeNull();
  });
});

describe("openState", () => {
  const w = applyPreset(week(), "work");
  it("is open inside the window", () => {
    expect(openState(w, 1, 9 * 60)).toEqual({ open: true, closesAt: "18:00", next: null });
    expect(openState(w, 1, 18 * 60).open).toBe(false);
  });
  it("finds the next opening: later today, tomorrow, after the weekend", () => {
    expect(openState(w, 2, 7 * 60).next).toEqual({ dayOffset: 0, day: 2, time: "09:00" });
    expect(openState(w, 2, 20 * 60).next).toEqual({ dayOffset: 1, day: 3, time: "09:00" });
    expect(openState(w, 4, 20 * 60).next).toEqual({ dayOffset: 3, day: 0, time: "09:00" });
    expect(openState(w, 5, 12 * 60).next?.dayOffset).toBe(2);
  });
  it("wraps to the same weekday next week and handles an empty week", () => {
    const one = applyPreset(week(), "clear").map((d) => (d.day === 1 ? { ...d, enabled: true } : d));
    expect(openState(one, 1, 20 * 60).next).toEqual({ dayOffset: 7, day: 1, time: "09:00" });
    expect(openState(applyPreset(week(), "clear"), 1, 600).next).toBeNull();
  });
  it("skips invalid days", () => {
    const bad = week().map((d) => ({ ...d, start: "19:00", end: "09:00" }));
    expect(openState(bad, 1, 600)).toEqual({ open: false, closesAt: null, next: null });
  });
});

describe("clockIn", () => {
  it("reads the zone's weekday and minute", () => {
    // 2026-10-19 is a Monday; 03:30 UTC = 08:30 in Tashkent.
    expect(clockIn("Asia/Tashkent", new Date("2026-10-19T03:30:00Z"))).toEqual({ day: 0, minute: 8 * 60 + 30 });
    expect(clockIn("Asia/Tashkent", new Date("2026-10-19T20:00:00Z"))).toEqual({ day: 1, minute: 60 });
    expect(clockIn("Not/AZone", new Date("2026-10-19T03:30:00Z"))).toEqual({ day: 0, minute: 8 * 60 + 30 });
  });
});
