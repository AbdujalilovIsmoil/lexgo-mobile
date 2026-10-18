import { memo } from "react";
import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { StatusPill } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { SecurityEvent } from "../model/types";

// One anomaly alert as a ticket: red strip while new, then the type, IP change / account / time chips and the review status.
export const SecurityEventRow = memo(function SecurityEventRow({ item }: { item: SecurityEvent }) {
  const { t, locale } = useT();
  const c = useColors();
  const key = `admAudit.types.${item.type}`;
  return (
    <CcTicket
      tint={item.status === "new" ? c.err : item.status === "resolved" ? c.ok : c.warn} icon="alert-octagon"
      title={t(key) !== key ? t(key) : item.title || item.type} subtitle={fmtDateTime(item.createdAt, locale)}
      badge={<StatusPill status={item.status} />}
      chips={<>
        {item.previousIp && item.currentIp ? <Pill small tone="warn" icon="globe" label={`${item.previousIp} → ${item.currentIp}`} /> : null}
        {item.ownerUserId ? <Pill small tone="blue" icon="user" label={`${item.ownerUserId.slice(0, 8)}…`} /> : null}
      </>}
    />
  );
});
