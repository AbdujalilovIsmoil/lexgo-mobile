import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { promotionAnswers } from "../api/inboxApi";
import { matches, signalOf } from "../lib/signal";
import { usePendingStore } from "./pendingStore";
import { promotionKeys } from "./queries";

// Settles pending checkouts: the realtime answer first, the notification inbox after a missed event.
export function usePromotionLive(uid: string): void {
  const qc = useQueryClient();
  const { t } = useT();
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: promotionKeys.all });
    void qc.invalidateQueries({ queryKey: ["pro-service"] });
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
  useEffect(() => settle.current(), [uid]);
}
