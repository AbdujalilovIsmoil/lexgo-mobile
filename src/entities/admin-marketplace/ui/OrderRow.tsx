import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { useMktLabels } from "../lib/useLabels";
import { statusColor } from "../model/status";
import type { MktOrder } from "../model/types";

const who = (p: { name: string; phone: string }) => p.name || p.phone || "—";

// One marketplace order as a ticket: strip in the status colour, service as the headline, "client → seller", the amount,
// status, work id and date as chips (the title keeps the full width).
export function OrderRow({ item, onPress }: { item: MktOrder; onPress: () => void }) {
  const { t, locale } = useT();
  const label = useMktLabels();
  return (
    <CcTicket
      tint={statusColor(item.status)} icon="shopping-bag" onPress={onPress}
      title={item.serviceTitle || "—"} subtitle={`${who(item.client)} → ${who(item.seller)}`}
      chips={<><Pill small tone="blue" label={`${fmtMoney(item.price)} ${t("adm.currency")}`} /><StatusPill status={item.status} label={label.status(item.status)} /><Pill small tone="gray" label={item.workId} /><Pill small tone="gray" icon="clock" label={fmtDateTime(item.createdAt, locale)} /></>}
    />
  );
}
