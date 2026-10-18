import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { useCcLabel, type CcCall } from "@/entities/admin-callcenter";
import { openTel } from "@/shared/lib/links";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const ICON = { incoming: "phone-incoming", outgoing: "phone-outgoing" } as const;

// A logged call: direction icon + colour, result and duration chips, one tap to call back.
export function CallTicket({ call }: { call: CcCall }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const missed = call.status === "missed";
  const dur = call.durationSec >= 60 ? t("admCcC.min", { n: Math.round(call.durationSec / 60) }) : call.durationSec > 0 ? t("admCcC.sec", { n: call.durationSec }) : "";
  return (
    <CcTicket
      tint={missed ? "#EF4444" : call.direction === "incoming" ? "#22C55E" : "#3B82F6"} icon={missed ? "phone-missed" : ICON[call.direction as keyof typeof ICON] ?? "phone"}
      title={call.phone || "—"} subtitle={[call.topic, fmtDateTime(call.createdAt, locale)].filter(Boolean).join(" · ")}
      badge={dur ? <Pill small tone="gray" icon="clock" label={dur} /> : undefined}
      chips={<>{call.result ? <Pill small tone={missed ? "err" : "blue"} label={label("admCcC.res", call.result)} /> : null}{call.nextAction ? <Pill small tone="warn" icon="arrow-right" label={call.nextAction} /> : null}</>}
      actions={call.phone ? <CcAction icon="phone" label={t("adm.call")} onPress={() => openTel(call.phone)} /> : undefined}
    />
  );
}
