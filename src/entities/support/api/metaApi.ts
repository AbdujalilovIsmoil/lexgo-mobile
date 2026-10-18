import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { MetaOption, SupportHours, SupportMeta } from "../model/types";

const options = (v: unknown): MetaOption[] =>
  asArr(v)
    .map((x) => (typeof x === "string" ? { key: x.trim(), label: "" } : { key: asStr(asDict(x).key ?? asDict(x).value).trim(), label: asStr(asDict(x).label).trim() }))
    .filter((o) => o.key);

// GET /support/meta — the categories / priorities the backend accepts.
export async function getSupportMeta(): Promise<SupportMeta> {
  const d = asDict(await http("/support/meta"));
  return { categories: options(d.categories), priorities: options(d.priorities) };
}

const hm = (v: unknown, fb: string) => (/^\d{1,2}:\d{2}/.test(asStr(v)) ? asStr(v).slice(0, 5) : fb);

// GET /calendar/business-hours — {schedule: {days: ["monday"…], start, end}, current: {is_business_hours}}.
export async function getSupportHours(): Promise<SupportHours> {
  const d = asDict(await http("/calendar/business-hours"));
  const s = asDict(d.schedule);
  const cur = asDict(d.current);
  const open = cur.is_business_hours ?? cur.is_working_time;
  return { open: typeof open === "boolean" ? open : null, days: asArr(s.days).map((x) => asStr(x).slice(0, 3).toLowerCase()), start: hm(s.start ?? cur.start, "09:00"), end: hm(s.end ?? cur.end, "19:00") };
}
