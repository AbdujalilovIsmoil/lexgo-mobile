import { getBusinessHours } from "./hoursApi";

const mockHttp = jest.fn();
jest.mock("@/shared/api", () => ({ http: (...a: unknown[]) => mockHttp(...a) }));

describe("getBusinessHours", () => {
  it("reads the real answer: day names, the schedule's hours, holidays", async () => {
    mockHttp.mockResolvedValueOnce({
      schedule: { days: ["monday", "tuesday", "wednesday", "thursday", "friday"], start: "09:00", end: "19:00", timezone: "Asia/Tashkent" },
      current: { is_working_day: true, is_working_time: false, is_business_hours: false, start: "09:00", end: "19:00" },
      holidays: ["2026-12-31", { date: "2027-01-01" }, "soon"],
      confirmation_deadline_30m: "2026-10-27T04:30:00+00:00",
    });
    expect(await getBusinessHours()).toEqual({ days: [1, 2, 3, 4, 5], start: "09:00", end: "19:00", holidays: ["2026-12-31", "2027-01-01"] });
  });

  it("falls back to the web's schedule when the days are numbers or missing", async () => {
    mockHttp.mockResolvedValueOnce({ schedule: { days: [1, 2, 3], start: "8:30", end: "nope" } });
    expect(await getBusinessHours()).toEqual({ days: [1, 2, 3, 4, 5, 6], start: "08:30", end: "19:00", holidays: [] });
  });
});
