import { memo, type ReactNode } from "react";
import { CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { Enter } from "./Enter";
import { HrmStatus } from "./HrmStatus";
import type { Approval } from "../model/typesWork";

type Props = { item: Approval; who: string; onPress: (item: Approval) => void; actions?: ReactNode; index?: number };
const TINT: Record<string, string> = { pending: "#F59E0B", approved: "#22C55E", rejected: "#EF4444" };

// One approval request as a ticket: decision-coloured strip, title, status badge, type / requester / time chips, round approve + reject.
export const ApprovalRow = memo(function ApprovalRow({ item, who, onPress, actions, index }: Props) {
  const { locale } = useT();
  return (
    <Enter index={index}>
    <CcTicket
      tint={TINT[item.status] ?? "#6366F1"} icon="shield" title={item.title || humanizeSlug(item.type)} subtitle={who || undefined}
      badge={<HrmStatus status={item.status} />} onPress={() => onPress(item)} actions={actions}
      chips={<><Pill small tone="blue" label={humanizeSlug(item.type)} /><Pill small tone="gray" icon="clock" label={fmtDateTime(item.createdAt, locale)} /></>}
    />
    </Enter>
  );
});
