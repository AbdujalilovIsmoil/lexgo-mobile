import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAccess } from "@/entities/access";
import { flowKeys, getRuntimeCaps } from "@/entities/market-flow";
import { listMarketOrders } from "@/entities/order/api/marketApi";
import { marketKeys } from "@/entities/order";
import { featureKeys, getMyFeatures } from "@/entities/plan";
import { orderKeys as proOrderKeys } from "@/entities/pro-order";
import { listOrders as listSellerOrders } from "@/entities/pro-order/api/orderApi";
import { useIsAuthed } from "@/entities/session";
import { useResync } from "@/shared/realtime";

const FRESH = 30_000; // read again unless it was read in the last 30 s

// TZ.md §2 for a signed-in client or yurist / advokat: right after start, on every return to the foreground and after every socket
// reconnect, the active marketplace orders, the plan's features and the platform's runtime capabilities are read again — the screens never
// depend on a push event they may have missed. (The user socket, unread notifications and the token refresh have their own mounts.)
export function MarketMounts() {
  const qc = useQueryClient();
  const authed = useIsAuthed();
  const a = useAccess();
  const scope = !authed ? "" : a.seller ? "seller" : "client";
  const last = useRef(0);
  const sync = () => {
    if (!scope) return;
    const now = Date.now();
    if (now - last.current < 5000) return; // foreground + reconnect often arrive together
    last.current = now;
    void qc.prefetchQuery({ queryKey: flowKeys.caps, queryFn: getRuntimeCaps, staleTime: FRESH });
    void qc.prefetchQuery({ queryKey: featureKeys.mine, queryFn: getMyFeatures, staleTime: FRESH });
    if (scope === "client") void qc.prefetchQuery({ queryKey: marketKeys.list, queryFn: listMarketOrders, staleTime: FRESH });
    else void qc.prefetchQuery({ queryKey: [...proOrderKeys.all, "list"], queryFn: listSellerOrders, staleTime: FRESH });
    void qc.invalidateQueries({ queryKey: ["market-orders", "detail"] });
    void qc.invalidateQueries({ queryKey: [...proOrderKeys.all, "one"] });
    void qc.invalidateQueries({ queryKey: flowKeys.all });
  };
  const ref = useRef(sync);
  useEffect(() => {
    ref.current = sync;
  });
  useEffect(() => {
    if (!scope) return;
    last.current = 0;
    ref.current();
    const sub = AppState.addEventListener("change", (s) => s === "active" && ref.current());
    return () => sub.remove();
  }, [scope]);
  useResync(() => ref.current());
  return null;
}
