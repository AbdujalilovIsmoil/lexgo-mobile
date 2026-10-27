import { translate, type Locale } from "@/shared/i18n";
import { durationParts, durationText, minutesText } from "./duration";
import type { RuntimeDuration } from "../model/types";

const tr = (l: Locale) => (key: string, p?: Record<string, string | number>) => translate(l, key, p);
const span = (value: number, unit: RuntimeDuration["unit"], calendar: RuntimeDuration["calendar"] = "calendar", weekdays: number[] = []): RuntimeDuration => ({ value, unit, calendar, weekdays });
const text = (d: RuntimeDuration, l: Locale) => durationText(d, tr(l), l);

describe("duration labels", () => {
  it("puts calendar time into each language's words", () => {
    expect([text(span(30, "minute"), "uz"), text(span(2, "hour"), "uz"), text(span(1, "day"), "uz")]).toEqual(["30 daqiqa", "2 soat", "1 kun"]);
    expect([text(span(1, "day"), "ru"), text(span(3, "day"), "ru"), text(span(5, "hour"), "ru"), text(span(21, "minute"), "ru")]).toEqual(["1 день", "3 дня", "5 часов", "21 минута"]);
    expect([text(span(1, "hour"), "en"), text(span(7, "day"), "en")]).toEqual(["1 hour", "7 days"]);
  });

  it("names business days and the backend's business week in the app's words, never as 'Monday-Friday'", () => {
    const week = span(7, "day", "business_days", [1, 2, 3, 4, 5]);
    expect(text(week, "uz")).toBe("7 ish kuni (Du–Ju)");
    expect(text(week, "ru")).toBe("7 рабочих дней (Пн–Пт)");
    expect(text(week, "en")).toBe("7 business days (Mon–Fri)");
    expect(durationParts(week, tr("uz"), "uz")).toEqual({ text: "7 ish kuni", days: "Du–Ju" });
    for (const l of ["uz", "ru", "en"] as const) expect(text(week, l)).not.toMatch(/Monday|Friday/);
  });

  it("says hours and minutes count on business days only, and lists a week that is not a run", () => {
    expect(text(span(8, "hour", "business_days", [1, 2, 3, 4, 5]), "uz")).toBe("8 soat, ish kunlarida (Du–Ju)");
    expect(text(span(1, "hour", "business_days", [1, 3, 5]), "en")).toBe("1 hour on business days (Mon, Wed, Fri)");
    expect(text(span(2, "day", "business_days"), "ru")).toBe("2 рабочих дня");
  });

  it("shows a guarantee's minutes in their largest whole unit", () => {
    expect([minutesText(180, tr("uz")), minutesText(2880, tr("uz")), minutesText(90, tr("uz"))]).toEqual(["3 soat", "2 kun", "90 daqiqa"]);
    expect(minutesText(60, tr("en"))).toBe("1 hour");
  });
});
