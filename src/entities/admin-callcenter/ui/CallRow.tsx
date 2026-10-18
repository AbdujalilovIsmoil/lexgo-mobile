import { RowCard, StatusPill } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useCcLabel } from "../model/labels";
import type { CcCall } from "../model/types";

const ICON = { incoming: "phone-incoming", outgoing: "phone-outgoing" } as const;

// One logged call: direction, phone and topic, result, duration and the agreed next step.
export function CallRow({ call }: { call: CcCall }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const dur = call.durationSec >= 60 ? t("admCcC.min", { n: Math.round(call.durationSec / 60) }) : call.durationSec > 0 ? t("admCcC.sec", { n: call.durationSec }) : "";
  const missed = call.status === "missed";
  return (
    <RowCard
      icon={missed ? "phone-missed" : ICON[call.direction as keyof typeof ICON] ?? "phone"}
      tint={missed ? "#EF4444" : call.direction === "incoming" ? "#22C55E" : "#3B82F6"}
      title={`${call.phone || "—"}${call.topic ? ` — ${call.topic}` : ""}`}
      subtitle={[label("admCcC.dir2", call.direction), label("admCcC.res", call.result), dur].filter(Boolean).join(" · ")}
      meta={[fmtDateTime(call.createdAt, locale), call.nextAction ? `${t("admCcC.next")}: ${call.nextAction}` : "", call.summary].filter(Boolean).join(" · ")}
      right={<StatusPill status={call.status} label={label("admCcC.callSt", call.status)} />}
    />
  );
}
