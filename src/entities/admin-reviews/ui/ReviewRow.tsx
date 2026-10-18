import type { ReactNode } from "react";
import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { sellerTypeLabel } from "../model/labels";
import { reviewTint } from "../model/tint";
import type { Review } from "../model/types";
import { Stars } from "./Stars";

// One client review as a ticket: status strip, lawyer, the comment on one line, stars + type + date chips, moderation buttons.
export function ReviewRow({ item, onPress, actions }: { item: Review; onPress: () => void; actions?: ReactNode }) {
  const { t, locale } = useT();
  const c = useColors();
  const kind = sellerTypeLabel(t, item.sellerType);
  return (
    <CcTicket
      tint={reviewTint(c, item.status)}
      avatar={item.lawyerName || "?"}
      title={item.lawyerName || "—"}
      subtitle={item.comment || undefined}
      badge={<StatusPill status={item.status} />}
      chips={<><Stars n={item.rating} />{kind ? <Pill label={kind} tone="gray" small /> : null}<Pill label={fmtDate(item.createdAt, locale)} tone="gray" icon="calendar" small /></>}
      actions={actions}
      onPress={onPress}
    />
  );
}
