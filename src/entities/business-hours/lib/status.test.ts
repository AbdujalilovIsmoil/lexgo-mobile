import { DEFAULT_HOURS, type BusinessHours } from "../api/hoursApi";
import { deadlineLabel, hoursState, responseDeadline } from "./status";

// The real schedule (GET /calendar/business-hours, 2026-10-26): Monday–Friday, 09:00–19:00, Asia/Tashkent.
const BH: BusinessHours = { days: [1, 2, 3, 4, 5], start: "09:00", end: "19:00", holidays: ["2026-10-28"] };
const tash = (iso: string) => Date.parse(`${iso}+05:00`);

describe("hoursState", () => {
  it("is open inside the hours of a working day, closed outside, a day off on weekends and holidays", () => {
    expect(hoursState(BH, tash("2026-10-26T10:00:00"))).toBe("open");
    expect(hoursState(BH, tash("2026-10-26T19:00:00"))).toBe("closed");
    expect(hoursState(BH, tash("2026-10-26T08:59:00"))).toBe("closed");
    expect(hoursState(BH, tash("2026-10-31T12:00:00"))).toBe("dayOff"); // Saturday
    expect(hoursState(BH, tash("2026-10-28T12:00:00"))).toBe("dayOff"); // holiday
    expect(hoursState(DEFAULT_HOURS, tash("2026-10-31T12:00:00"))).toBe("open"); // the fallback works on Saturdays
  });
});

describe("responseDeadline", () => {
  it("counts working minutes only", () => {
    expect(responseDeadline(BH, tash("2026-10-26T10:00:00"))).toBe(tash("2026-10-26T10:30:00"));
    // 18:50 Monday: 10 minutes left that day, the other 20 on Tuesday morning
    expect(responseDeadline(BH, tash("2026-10-26T18:50:00"))).toBe(tash("2026-10-27T09:20:00"));
    // Tuesday evening → Wednesday is a holiday → Thursday 09:30
    expect(responseDeadline(BH, tash("2026-10-27T20:00:00"))).toBe(tash("2026-10-29T09:30:00"));
    // Friday evening → Monday 09:30
    expect(responseDeadline(BH, tash("2026-10-30T19:30:00"))).toBe(tash("2026-11-02T09:30:00"));
  });
});

describe("deadlineLabel", () => {
  const words = { today: "Bugun", tomorrow: "Ertaga" };
  it("says today / tomorrow / the date, in Tashkent time", () => {
    const now = tash("2026-10-26T18:50:00");
    expect(deadlineLabel(tash("2026-10-26T18:59:00"), now, words)).toBe("Bugun 18:59");
    expect(deadlineLabel(tash("2026-10-27T09:20:00"), now, words)).toBe("Ertaga 09:20");
    expect(deadlineLabel(tash("2026-10-29T09:30:00"), now, words)).toBe("29.10, 09:30");
  });
});
