import { daysLeft } from "./daysLeft";

const now = new Date(2026, 9, 18, 16, 0).getTime();
it("counts calendar days regardless of the hour", () => {
  expect(daysLeft(new Date(2026, 9, 18, 9, 0).toISOString(), now)).toBe(0);
  expect(daysLeft(new Date(2026, 9, 21, 23, 0).toISOString(), now)).toBe(3);
  expect(daysLeft(new Date(2026, 9, 16, 12, 0).toISOString(), now)).toBe(-2);
});
it("is 0 without a usable date", () => {
  expect(daysLeft("", now)).toBe(0);
  expect(daysLeft("nope", now)).toBe(0);
});
