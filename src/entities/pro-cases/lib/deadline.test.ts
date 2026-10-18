import { dueOf } from "./deadline";

const now = new Date(2026, 9, 18, 12, 0).getTime();
const at = (day: number, h = 10) => new Date(2026, 9, day, h).toISOString();

describe("dueOf", () => {
  it("late, today, soon, later", () => {
    expect(dueOf(at(16), false, now)).toBe("overdue");
    expect(dueOf(at(18, 15), false, now)).toBe("today");
    expect(dueOf(at(18, 9), false, now)).toBe("today"); // earlier today is still today, not late
    expect(dueOf(at(20), false, now)).toBe("soon");
    expect(dueOf(at(25), false, now)).toBe("later");
  });
  it("nothing for a finished case, an empty or a broken date", () => {
    expect(dueOf(at(16), true, now)).toBe("none");
    expect(dueOf("", false, now)).toBe("none");
    expect(dueOf("nope", false, now)).toBe("none");
  });
});
