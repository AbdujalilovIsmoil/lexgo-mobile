import { memo } from "react";
import { CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Enter } from "./Enter";
import { HrmStatus } from "./HrmStatus";
import { WeekStrip } from "./WeekStrip";
import type { Schedule } from "../model/typesOps";

const TINT = "#8B5CF6";

// One work schedule as a ticket: title, who it applies to, a Mon-Sun week strip and the hours / break chips.
export const ScheduleRow = memo(function ScheduleRow({ item, scope, index }: { item: Schedule; scope: string; index?: number }) {
  const { t } = useT();
  const first = item.weekly[0];
  return (
    <Enter index={index}>
      <CcTicket
        tint={TINT} icon="calendar" title={item.title} subtitle={scope || t("admHrm.allStaff")} badge={<HrmStatus status={item.status} />}
        chips={<>
          <WeekStrip weekly={item.weekly} tint={TINT} />
          {first ? <Pill small tone="gray" icon="clock" label={`${first.start}–${first.end}`} /> : null}
          {first?.breakMinutes ? <Pill small tone="gray" label={t("admHrmU.breakMin", { m: first.breakMinutes })} /> : null}
        </>}
      />
    </Enter>
  );
});
