import { weekdayShort } from "@/shared/lib/calendarNames";
import type { RuntimeDuration } from "../model/types";

type T = (key: string, p?: Record<string, string | number>) => string;

// The backend's business week in the app's words: 1…5 is "Du–Ju" / "Пн–Пт" / "Mon–Fri" (a run of three or more days as a range,
// anything else listed). The backend's English business_days_label is never shown as it is.
function weekdaysLabel(days: number[], locale: string): string {
  const d = [...new Set(days)].filter((x) => x >= 1 && x <= 7).sort((a, b) => a - b);
  if (!d.length) return "";
  const run = d.length > 2 && d.every((x, i) => !i || x === d[i - 1] + 1);
  return run ? `${weekdayShort(d[0], locale)}–${weekdayShort(d[d.length - 1], locale)}` : d.map((x) => weekdayShort(x, locale)).join(", ");
}

// "5 ish kuni" + "Du–Ju", "8 soat, ish kunlarida", "2 soat": the backend's value, unit and calendar put into words — information only,
// no deadline is worked out from it on the phone.
export function durationParts(d: RuntimeDuration, t: T, locale: string): { text: string; days: string } {
  const n = Math.round(d.value * 10) / 10;
  if (d.calendar !== "business_days") return { text: t(`srt.dur.${d.unit}`, { n }), days: "" };
  const text = d.unit === "day" ? t("srt.dur.bizDay", { n }) : t("srt.dur.bizTime", { time: t(`srt.dur.${d.unit}`, { n }) });
  return { text, days: weekdaysLabel(d.weekdays, locale) };
}

export function durationText(d: RuntimeDuration, t: T, locale: string): string {
  const p = durationParts(d, t, locale);
  return p.days ? `${p.text} (${p.days})` : p.text;
}

// A count of minutes (how fast a guarantee is resolved) in its largest whole unit: 180 → "3 soat", 2880 → "2 kun", 90 → "90 daqiqa".
export function minutesText(m: number, t: T): string {
  if (m % 1440 === 0) return t("srt.dur.day", { n: m / 1440 });
  return m % 60 === 0 ? t("srt.dur.hour", { n: m / 60 }) : t("srt.dur.minute", { n: m });
}
