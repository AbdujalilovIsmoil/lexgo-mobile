import { dayCounts, onDay, phaseOf, shiftWeek, startOfWeek, weekDays } from "./week";
import { dayKey, groupByDay } from "./groupByDay";

const at = (iso: string) => new Date(iso);
const m = (startedAt: string, callStatus = "active") => ({ startedAt, callStatus, callId: startedAt });

describe("week strip", () => {
  it("starts on Monday and has seven days", () => {
    const wed = at("2026-10-21T10:00:00"); // Wednesday
    expect(startOfWeek(wed).getDay()).toBe(1);
    const days = weekDays(wed, wed);
    expect(days).toHaveLength(7);
    expect(days.map((d) => d.num)).toEqual([19, 20, 21, 22, 23, 24, 25]);
    expect(days.filter((d) => d.today).map((d) => d.num)).toEqual([21]);
  });
  it("Sunday belongs to the week that started six days earlier", () => {
    expect(weekDays(at("2026-10-25T12:00:00"), at("2026-10-25T12:00:00"))[0].num).toBe(19);
  });
  it("shifts by whole weeks across a month end", () => {
    expect(weekDays(shiftWeek(at("2026-10-21T10:00:00"), 2), at("2026-10-21T10:00:00")).map((d) => d.num)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(weekDays(shiftWeek(at("2026-10-21T10:00:00"), -3), at("2026-10-21T10:00:00"))[0].num).toBe(28);
  });
  it("marks the days that have meetings and filters by day", () => {
    const list = [m("2026-10-20T09:00:00"), m("2026-10-20T15:00:00"), m("2026-10-22T11:00:00")];
    const counts = dayCounts(list);
    expect(counts.get(dayKey("2026-10-20T00:00:00"))).toBe(2);
    expect(counts.get(dayKey("2026-10-22T00:00:00"))).toBe(1);
    expect(counts.size).toBe(2);
    expect(onDay(list, dayKey("2026-10-20T00:00:00"))).toHaveLength(2);
    expect(onDay(list, null)).toHaveLength(3);
    expect(onDay(list, dayKey("2026-10-21T00:00:00"))).toHaveLength(0);
  });
});

describe("phaseOf", () => {
  const now = at("2026-10-20T10:00:00");
  it("active is live, ended kinds are over", () => {
    expect(phaseOf(m("2026-10-20T09:00:00", "active"), now)).toBe("live");
    expect(phaseOf(m("2026-10-20T09:00:00", "ended"), now)).toBe("over");
    expect(phaseOf(m("2026-10-20T09:00:00", "cancelled"), now)).toBe("over");
  });
  it("scheduled is soon within the window (or overdue), later beyond it", () => {
    expect(phaseOf(m("2026-10-20T10:10:00", "scheduled"), now)).toBe("soon");
    expect(phaseOf(m("2026-10-20T09:40:00", "scheduled"), now)).toBe("soon");
    expect(phaseOf(m("2026-10-20T11:00:00", "scheduled"), now)).toBe("later");
    expect(phaseOf(m("", "scheduled"), now)).toBe("soon");
  });
});

describe("groupByDay", () => {
  it("groups neighbours of the same day under one title", () => {
    const sections = groupByDay([m("2026-10-20T09:00:00"), m("2026-10-20T15:00:00"), m("2026-10-22T11:00:00")] as never, () => "x");
    expect(sections.map((s) => s.data.length)).toEqual([2, 1]);
  });
});
