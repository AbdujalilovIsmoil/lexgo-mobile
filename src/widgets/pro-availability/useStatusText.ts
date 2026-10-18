import { useEffect, useState } from "react";
import { clockIn, openState, type Availability } from "@/entities/pro-availability";
import { useT } from "@/shared/i18n";

export type Presence = "online" | "closed" | "paused";
export type StatusText = { state: Presence; title: string; sub: string };

// Re-renders every 30 s so "open now" stays true while the screen is open.
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// How clients see the seller right now, computed from the draft schedule (so it follows edits live).
// `paused`: the profile's own availability switch is "offline" regardless of the hours.
export function useStatusText(cur: Availability, now: Date, paused: boolean): StatusText {
  const { t } = useT();
  const { day, minute } = clockIn(cur.timezone, now);
  const st = openState(cur.weekly, day, minute);
  if (paused) return { state: "paused", title: t("availUx.paused"), sub: t("availUx.paused2") };
  if (st.open) return { state: "online", title: t("availUx.online"), sub: t("availUx.closesAt", { time: st.closesAt ?? "" }) };
  const n = st.next;
  const sub = !n
    ? t("availUx.noNext")
    : n.dayOffset === 0
      ? t("availUx.nextToday", { time: n.time })
      : n.dayOffset === 1
        ? t("availUx.nextTomorrow", { time: n.time })
        : t("availUx.nextDay", { day: t(`sl8.day.${n.day}`), time: n.time });
  return { state: "closed", title: t("availUx.closed"), sub };
}
