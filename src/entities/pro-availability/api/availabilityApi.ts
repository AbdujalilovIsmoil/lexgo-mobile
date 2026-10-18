import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { DAYS, DEFAULT_DEADLINES, type Availability } from "../model/types";

// The backend sends {user_id, source, availability:{timezone, weekly:[{day,enabled,start,end}], exceptions, response_deadlines_minutes}}.
export function normAvailability(v: unknown): Availability {
  const root = asDict(v);
  const a = asDict(root.availability ?? root);
  const rows = asArr(a.weekly).map((x) => asDict(x));
  const dl = asDict(a.response_deadlines_minutes);
  return {
    timezone: asStr(a.timezone, "Asia/Tashkent"),
    // A day the server does not list falls back to the platform default: Mon–Sat 09:00–19:00.
    weekly: DAYS.map((day) => {
      const r = rows.find((x) => asNum(x.day, -1) === day);
      return { day, enabled: r ? r.enabled !== false : day < 6, start: asStr(r?.start, "09:00"), end: asStr(r?.end, "19:00") };
    }),
    exceptions: asArr(a.exceptions).map((x) => asDict(x)),
    deadlines: {
      manual: asNum(dl.manual) || DEFAULT_DEADLINES.manual,
      auto: asNum(dl.auto) || DEFAULT_DEADLINES.auto,
      sos: asNum(dl.sos) || DEFAULT_DEADLINES.sos,
    },
    source: asStr(root.source) === "custom" ? "custom" : "default",
  };
}

export const getAvailability = async () => normAvailability(await http("/lawyers/me/availability"));

export async function saveAvailability(a: Availability): Promise<Availability> {
  const body = {
    timezone: a.timezone,
    weekly: a.weekly.map((d) => ({ day: d.day, enabled: d.enabled, start: d.start, end: d.end })),
    exceptions: a.exceptions,
    response_deadlines_minutes: a.deadlines,
  };
  return normAvailability(await http("/lawyers/me/availability", { method: "PUT", body }));
}
