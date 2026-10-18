import { commissionLadder, completeness, groupTasks, monthGrid, profileScore } from "./home";
import type { CabinetCase } from "../model/types";

const c = (p: Partial<CabinetCase>): CabinetCase => ({ id: "1", number: "", title: "T", stage: "", status: "active", nextAction: "", deadlineAt: "", ...p });

describe("groupTasks", () => {
  const today = "2026-10-18";
  it("today, later or undated, and done", () => {
    const g = groupTasks([c({ id: "a", deadlineAt: "2026-10-18T09:00:00Z" }), c({ id: "b", deadlineAt: "2026-10-25T09:00:00Z" }), c({ id: "u" }), c({ id: "d", status: "completed", deadlineAt: "2026-10-18T09:00:00Z" }), c({ id: "r", status: "archived" })], today);
    expect(g.today.map((x) => x.id)).toEqual(["a"]);
    expect(g.upcoming.map((x) => x.id)).toEqual(["b", "u"]);
    expect(g.done.map((x) => x.id)).toEqual(["d", "r"]);
  });
  it("an empty list gives three empty groups", () => {
    expect(groupTasks([], today)).toEqual({ today: [], upcoming: [], done: [] });
  });
});

describe("completeness", () => {
  it("whole percent, capped, zero without steps", () => {
    expect(completeness(3, 5)).toBe(60);
    expect(completeness(7, 5)).toBe(100);
    expect(completeness(0, 0)).toBe(0);
  });
});

describe("monthGrid", () => {
  it("Monday first, padded to whole weeks", () => {
    const g = monthGrid(2026, 9); // October 2026 starts on a Thursday
    expect(g.slice(0, 4)).toEqual([null, null, null, 1]);
    expect(g.filter((x) => x).length).toBe(31);
    expect(g.length % 7).toBe(0);
  });
  it("a month starting on Monday has no leading blanks", () => {
    expect(monthGrid(2026, 5)[0]).toBe(1); // June 2026 starts on a Monday
  });
});

describe("commissionLadder (seller referral steps)", () => {
  it("base 18 %, then 16 / 15 / 13 at 5 / 10 / 20 active sellers", () => {
    expect(commissionLadder(0)).toEqual({ now: 18, goal: 5, next: 16 });
    expect(commissionLadder(5)).toEqual({ now: 16, goal: 10, next: 15 });
    expect(commissionLadder(12)).toEqual({ now: 15, goal: 20, next: 13 });
    expect(commissionLadder(25)).toEqual({ now: 13, goal: 20, next: null });
  });
});

describe("profileScore", () => {
  it("lawyer: eight checks", () => {
    expect(profileScore({}, false)).toBe(0);
    expect(profileScore({ lawyer_name: "A", region: "tashkent", languages: ["uz"], bio: "x" }, false)).toBe(50);
    expect(profileScore({ name: "A", avatar_url: "u", region: "r", languages: ["uz"], education: "e", experience_years: 3, bio: "b", services: [{}] }, false)).toBe(100);
  });
  it("advocate: nine checks, empty strings and zero count as missing", () => {
    expect(profileScore({ name: " ", license_number: "", experience_years: 0 }, true)).toBe(0);
    expect(profileScore({ name: "A", email: "a@b.uz", region: "r" }, true)).toBe(33);
  });
});
