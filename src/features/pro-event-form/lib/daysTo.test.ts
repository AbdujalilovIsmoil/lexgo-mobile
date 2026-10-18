import { daysTo } from "./daysTo";

const now = new Date(2026, 9, 18, 15, 0).getTime();

it("counts calendar days, whatever the time of day", () => {
  expect(daysTo("2026-10-18", now)).toBe(0);
  expect(daysTo("2026-10-25", now)).toBe(7);
  expect(daysTo("2026-11-18", now)).toBe(31);
  expect(daysTo("2026-10-15", now)).toBe(-3);
  expect(daysTo("2026-10-19T09:00:00Z", now)).toBe(1);
});
it("is 0 for something that is not a date", () => expect(daysTo("", now)).toBe(0));
