import { daysAgo, fmtDate, fmtDateTime, fmtRating, fmtTime, humanizeSlug, initials, isoDay, mmss, timeAgo } from "./format";

const t = (k: string, p?: Record<string, string | number>) => `${k}${p ? `:${p.n}` : ""}`;

describe("initials", () => {
  it("takes up to two capital letters", () => {
    expect(initials("Demo Advokat 1")).toBe("DA");
    expect(initials("  ali  ")).toBe("A");
    expect(initials("")).toBe("");
  });
});

describe("humanizeSlug", () => {
  it("cleans fixture slugs", () => {
    expect(humanizeSlug("fixture-nikoh-shartnomasi")).toBe("Nikoh shartnomasi");
    expect(humanizeSlug("area_mehnat_huquqi")).toBe("Mehnat huquqi");
    expect(humanizeSlug("")).toBe("");
  });
});

describe("dates", () => {
  it("returns empty strings for bad input", () => {
    expect(fmtDate(undefined)).toBe("");
    expect(fmtDate("nope")).toBe("");
    expect(fmtTime("nope")).toBe("");
    expect(fmtDateTime("nope")).toBe("");
  });
  it("formats a time with leading zeros", () => {
    expect(fmtTime(new Date(2026, 0, 5, 7, 3).toISOString())).toBe("07:03");
  });
  it("writes the month in the app's language on every phone (Hermes has no Uzbek calendar data)", () => {
    const iso = new Date(2026, 9, 6, 12).toISOString();
    expect(fmtDate(iso, "uz")).toBe("06 okt 2026");
    expect(fmtDate(iso, "ru")).toBe("06 окт. 2026");
    expect(fmtDate(iso, "en")).toBe("06 Oct 2026");
  });
  it("isoDay is the local calendar day, daysAgo steps back", () => {
    expect(isoDay(new Date(2026, 9, 5, 23, 59))).toBe("2026-10-05");
    expect(daysAgo(0)).toBe(isoDay());
    expect(daysAgo(1) < daysAgo(0)).toBe(true);
  });
});

describe("mmss", () => {
  it("rounds up and never goes negative", () => {
    expect(mmss(0)).toBe("00:00");
    expect(mmss(-500)).toBe("00:00");
    expect(mmss(61_001)).toBe("01:02");
    expect(mmss(15 * 60_000)).toBe("15:00");
  });
});

describe("timeAgo", () => {
  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
  it("picks now / minutes / hours / days", () => {
    expect(timeAgo(ago(10_000), t)).toBe("admSt.ago.now");
    expect(timeAgo(ago(5 * 60_000), t)).toBe("admSt.ago.min:5");
    expect(timeAgo(ago(3 * 3_600_000), t)).toBe("admSt.ago.hour:3");
    expect(timeAgo(ago(50 * 3_600_000), t)).toBe("admSt.ago.day:2");
  });
  it("is empty for the future or garbage", () => {
    expect(timeAgo(new Date(Date.now() + 60_000).toISOString(), t)).toBe("");
    expect(timeAgo(undefined, t)).toBe("");
  });
});

describe("fmtRating", () => {
  it("uses the locale's decimal separator", () => {
    expect(fmtRating(4.86)).toBe("4.9");
    expect(fmtRating(4.86, "ru")).toBe("4,9");
    expect(fmtRating(5)).toBe("5.0");
  });
});
