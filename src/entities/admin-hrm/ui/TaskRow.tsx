import { memo, type ReactNode } from "react";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PRIORITY_TINT } from "../model/constants";
import { isOverdue } from "../lib/tone";
import { DueChip } from "./DueChip";
import { Enter } from "./Enter";
import { HrmStatus } from "./HrmStatus";
import type { Task } from "../model/typesWork";

type Props = { item: Task; onPress: (x: Task) => void; actions?: ReactNode; index?: number };

// One work item as a ticket: red strip when overdue (else priority colour), status badge, deadline / project / progress chips,
// optional extra round buttons (quick status) before the primary "open" one.
export const TaskRow = memo(function TaskRow({ item, onPress, actions, index }: Props) {
  const { t } = useT();
  const late = isOverdue(item);
  const open = () => onPress(item);
  return (
    <Enter index={index}>
      <CcTicket
        tint={late ? "#EF4444" : PRIORITY_TINT[item.priority] ?? "#3B82F6"} icon={late ? "alert-circle" : "check-square"} title={item.title} titleLines={2}
        subtitle={[item.code, item.responsibleName].filter(Boolean).join(" · ")} badge={<HrmStatus status={item.status} />} onPress={open}
        chips={<>
          <DueChip task={item} />
          {item.project ? <Pill small tone="gray" icon="folder" label={item.project} /> : null}
          {item.progress >= 0 ? <Pill small tone="blue" label={t("admHrmU.progress", { n: item.progress })} /> : null}
        </>}
        actions={<>{actions}<CcAction primary icon="arrow-right" label={t("admHrmU.openTask")} onPress={open} /></>}
      />
    </Enter>
  );
});
