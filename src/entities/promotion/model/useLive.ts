import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { promotionAnswers } from "../api/inboxApi";
import { matches, signalOf } from "../lib/signal";
import { usePendingStore } from "./pendingStore";
import { isRunning } from "../lib/settle";
import { PROMO_ACTIVE, promotionKeys, usePromoStatus } from "./queries";

// Settles pending checkouts: the realtime answer first, the notification inbox after a missed event. Whatever settles also reads
// the running promotions again (GET /promotions/active), so an approved banner or boost shows on the marketplace at once.
export function usePromotionLive(uid: string): void {
  const qc = useQueryClient();
  const { t } = useT();
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: promotionKeys.all });
    void qc.invalidateQueries({ queryKey: ["pro-service"] });
    void qc.invalidateQueries({ queryKey: PROMO_ACTIVE });
  };
  const announce = (kind: "approved" | "rejected", n: number) => {
    if (n > 0) toast(t(kind === "approved" ? "sl10.toast.approved" : "sl10.toast.rejected"), kind === "approved" ? "ok" : "err");
  };
  useUserEvents(["promotion.", "notification.created"], (e) => {
    const s = signalOf(e);
    if (!s) return;
    announce(s.kind, usePendingStore.getState().drop(uid, (p) => matches(p, s)).length);
    refresh();
  });
  const settle = useRef(() => {});
  useEffect(() => {
    settle.current = () => {
      if (!uid) return;
      const store = usePendingStore.getState();
      store.drop(uid, () => false); // forgets requests older than the TTL
      if (!Object.keys(usePendingStore.getState().items).some((k) => k.startsWith(`${uid}|`))) return;
      promotionAnswers()
        .then((ans) => {
          for (const kind of ["approved", "rejected"] as const) announce(kind, usePendingStore.getState().drop(uid, (p) => ans[p.requestId] === kind).length);
          refresh();
        })
        .catch(() => {});
    };
  });
  useResync(() => settle.current());
  // The request turned into a running promotion (approved in Telegram): forget the pending entry and say so once.
  const status = usePromoStatus();
  const running = useRef(() => {});
  useEffect(() => {
    running.current = () => {
      const items = status.data?.items;
      if (!uid || !items?.length) return;
      const live = usePendingStore.getState().drop(uid, (p) => isRunning(p, items)).length;
      announce("approved", live);
      if (live) void qc.invalidateQueries({ queryKey: PROMO_ACTIVE });
    };
  });
  useEffect(() => running.current(), [status.data, uid]);
  useEffect(() => settle.current(), [uid]);
}
