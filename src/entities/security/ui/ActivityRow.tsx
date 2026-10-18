import { Pill } from "@/shared/ui";
import { TimelineItem } from "@/shared/ui/profile";
import { fmtDateTime, timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { groupOf } from "../lib/activityGroup";
import type { ActivityEntry } from "../model/types";

// One line of the account audit log on a timeline; the dot colour follows the group (red if it failed).
export function ActivityRow({ item, last }: { item: ActivityEntry; last?: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const uz = locale === "uz";
  const key = `admSecC.act.${item.action}`;
  const known = t(key);
  const plain = item.action.replace(/[_.-]+/g, " ").trim();
  const title = (uz && item.titleUz) || (known === key ? plain.charAt(0).toUpperCase() + plain.slice(1) : known);
  const failed = !!item.outcome && !/^(success|ok)$/i.test(item.outcome);
  const tints = { auth: c.accent, orders: c.ok, documents: c.cyText, profile: c.warn, other: c.gray2 };
  return (
    <TimelineItem
      color={failed ? c.err : tints[groupOf(item.action)]}
      title={title || "—"}
      subtitle={(uz && item.descriptionUz) || item.detail}
      meta={[item.ip, fmtDateTime(item.createdAt, locale)].filter(Boolean).join(" · ")}
      time={timeAgo(item.createdAt, t)}
      last={last}
    >
      {failed ? <Pill label={t("admSecC.failed")} tone="err" small /> : null}
    </TimelineItem>
  );
}
