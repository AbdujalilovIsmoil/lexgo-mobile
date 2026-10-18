import { useMemo } from "react";
import { isCancelled, useEvents, type CalEvent } from "@/entities/pro-calendar";
import { dayKey } from "@/shared/lib/pro/dates";

// Events grouped by local day (sorted by start), plus the upcoming ones from `today` on.
export function useCalendarModel(today: string) {
  const query = useEvents();
  const events = useMemo(() => query.data ?? [], [query.data]);
  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) map.set(dayKey(e.startsAt), [...(map.get(dayKey(e.startsAt)) ?? []), e]);
    return map;
  }, [events]);
  const upcoming = useMemo(() => events.filter((e) => dayKey(e.startsAt) >= today && !isCancelled(e)), [events, today]);
  return { query, events, byDay, upcoming };
}
