import { TimelineItem } from "@/shared/ui/profile";
import { fmtDateTime, timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { SecurityEvent } from "../model/types";

// A security event on the timeline: a sign-in from a new IP or device, etc. Red when it was blocked/failed.
export function EventRow({ item, last }: { item: SecurityEvent; last?: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const key = `admSecC.ev.${item.type}`;
  const label = t(key);
  const route = item.fromIp && item.ip ? `${item.fromIp} → ${item.ip}` : item.ip || item.fromIp;
  const bad = /block|fail|denied|suspicious|danger/i.test(`${item.type} ${item.status}`);
  return (
    <TimelineItem
      color={bad ? c.err : c.warn}
      title={label === key ? item.title || item.type : label}
      subtitle={route}
      meta={[item.agent, fmtDateTime(item.createdAt, locale)].filter(Boolean).join(" · ")}
      time={timeAgo(item.createdAt, t)}
      last={last}
    />
  );
}
