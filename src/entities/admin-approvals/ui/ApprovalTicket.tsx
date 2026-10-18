import type { ReactNode } from "react";
import { Pill, type PillTone } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { statusText, typeLabel } from "../model/labels";
import { approvalTint } from "../model/stats";
import type { Approval } from "../model/types";

const TONE: Record<string, PillTone> = { pending: "warn", approved: "ok", completed: "ok", rejected: "err", cancelled: "err", partial: "blue", admin_approved: "blue", manager_approved: "blue" };

// One approval as a ticket: colour strip by sign-off progress, type + status, admin/manager ticks and round sign buttons.
export function ApprovalTicket({ item, onPress, actions }: { item: Approval; onPress: () => void; actions?: ReactNode }) {
  const { t, locale } = useT();
  const tick = (done: boolean, label: string) => <Pill label={`${label}${done ? " ✓" : ""}`} tone={done ? "ok" : "gray"} small />;
  return (
    <CcTicket
      tint={approvalTint(item)} icon="check-square" title={typeLabel(t, item.type)}
      subtitle={[item.workId, item.summary || item.reason, fmtDate(item.createdAt, locale)].filter(Boolean).join(" · ")}
      badge={<Pill label={statusText(t, item.status)} tone={TONE[item.status] ?? "gray"} small />}
      chips={<>{tick(item.adminApproved, t("admAppr.admin"))}{tick(item.managerApproved, t("admAppr.manager"))}</>}
      actions={actions} onPress={onPress}
    />
  );
}
