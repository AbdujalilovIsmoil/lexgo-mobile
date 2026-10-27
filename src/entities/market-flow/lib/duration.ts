import { clock } from "./window";
import type { FlowDuration } from "../model/types";

type T = (key: string, params?: Record<string, string | number>) => string;

// "5 ish kuni" / "2 soat" — the delivery time in the app's own words (the backend's English business_days_label is never shown as is).
export function durationText(d: FlowDuration, t: T): string {
  const unit = d.unit === "minute" || d.unit === "hour" ? d.unit : "day";
  if (unit === "day" && d.calendar === "business_days") return t("mf.dur.dayBiz", { n: d.value });
  const base = t(`mf.dur.${unit}`, { n: d.value });
  return d.calendar === "business_days" ? t("mf.dur.biz", { d: base }) : base;
}

// What is left of a deadline: "12:34" in the last hour, else "2 kun 5 soat" / "5 soat 12 daqiqa" (it then only needs a coarse clock).
export function leftText(ms: number, t: T): string {
  if (ms < 3600_000) return clock(ms);
  const min = Math.ceil(ms / 60000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return [d ? t("mf.dur.day", { n: d }) : "", h ? t("mf.dur.hour", { n: h }) : "", !d && m ? t("mf.dur.minute", { n: m }) : ""].filter(Boolean).join(" ");
}
