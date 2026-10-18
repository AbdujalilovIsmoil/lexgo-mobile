import { memo } from "react";
import { CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { fmtDate, fmtTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { fmtMinutes } from "../lib/format";
import { dayTint } from "../lib/dayTint";
import { Enter } from "./Enter";
import { HrmStatus } from "./HrmStatus";
import type { AttendanceDay } from "../model/typesOps";

type Props = { item: AttendanceDay; name?: string; onPress?: () => void; index?: number };

// One attendance day as a ticket: status strip, date, in – out, status badge and worked / overtime / late chips.
export const DayRow = memo(function DayRow({ item, name, onPress, index }: Props) {
  const { t, locale } = useT();
  const times = item.firstIn ? `${fmtTime(item.firstIn)} – ${item.lastOut ? fmtTime(item.lastOut) : "…"}` : t("admHrm.noCheckIn");
  return (
    <Enter index={index}>
    <CcTicket
      tint={dayTint(item.status)} {...(name ? { avatar: name } : { icon: "clock" as const })} title={name || fmtDate(item.date, locale)} subtitle={[name ? fmtDate(item.date, locale) : "", times].filter(Boolean).join(" · ")}
      badge={<HrmStatus status={item.status} />} onPress={onPress}
      chips={<>
        <Pill small tone="blue" icon="clock" label={`${fmtMinutes(item.worked, t)} / ${fmtMinutes(item.planned, t)}`} />
        {item.overtime ? <Pill small tone="ok" label={`+${fmtMinutes(item.overtime, t)}`} /> : null}
        {item.late ? <Pill small tone="warn" label={`${t("admHrm.late")} ${fmtMinutes(item.late, t)}`} /> : null}
      </>}
    />
    </Enter>
  );
});
