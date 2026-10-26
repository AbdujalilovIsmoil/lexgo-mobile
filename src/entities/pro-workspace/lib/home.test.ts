import { commissionLadder, groupTasks } from "./home";
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

describe("commissionLadder (seller referral steps)", () => {
  it("base 18 %, then 16 / 15 / 13 at 5 / 10 / 20 active sellers", () => {
    expect(commissionLadder(0)).toEqual({ now: 18, goal: 5, next: 16 });
    expect(commissionLadder(5)).toEqual({ now: 16, goal: 10, next: 15 });
    expect(commissionLadder(12)).toEqual({ now: 15, goal: 20, next: 13 });
    expect(commissionLadder(25)).toEqual({ now: 13, goal: 20, next: null });
  });
});

