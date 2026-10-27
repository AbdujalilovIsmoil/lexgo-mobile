import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { asDict, asStr } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { ADDITIONAL_EVENTS } from "../lib/events";
import { orderKeys } from "./queries";

const INNER = /^(order_|marketplace_|marketplace\.|payment_paid)/;

// Realtime: a paid / changed order refetches the queue — no polling (TZ 45.4). The supplemental-payment events also say so.
export function useOrderLive(): void {
  const qc = useQueryClient();
  const { t } = useT();
  const refresh = () => void qc.invalidateQueries({ queryKey: orderKeys.all });
  useUserEvents(["marketplace.", "marketplace_", "order.", "order_", "notification.created"], (e) => {
    const extra = ADDITIONAL_EVENTS[e.event];
    if (extra) toast(t(`ntd.sellerV2.ev.${extra.key}`), extra.tone);
    if (e.event !== "notification.created") return refresh();
    if (INNER.test(asStr(asDict(asDict(e.notification).data).event))) refresh();
  });
  useResync(refresh);
}
