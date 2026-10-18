import type { ReactNode } from "react";
import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { roleLabel, statusLabel } from "../model/labels";
import type { SellerRequest } from "../model/types";

// One registration request as a ticket: status strip, applicant, role · phone, region / date chips, accept / reject buttons.
export function RequestRow({ item, onPress, actions }: { item: SellerRequest; onPress: () => void; actions?: ReactNode }) {
  const { t, locale } = useT();
  const c = useColors();
  const tint = item.status === "approved" ? c.ok : item.status === "rejected" ? c.err : c.warn;
  return (
    <CcTicket
      tint={tint}
      avatar={item.name || item.phone || "?"}
      title={item.name || item.phone}
      subtitle={[roleLabel(t, item.role), item.phone].filter(Boolean).join(" · ")}
      badge={<StatusPill status={item.status} label={statusLabel(t, item.status)} />}
      chips={<>{item.region ? <Pill small tone="gray" icon="map-pin" label={item.region} /> : null}{item.workId ? <Pill small tone="gray" label={item.workId} /> : null}<Pill small tone="gray" icon="calendar" label={fmtDate(item.createdAt, locale)} /></>}
      actions={actions}
      onPress={onPress}
    />
  );
}
