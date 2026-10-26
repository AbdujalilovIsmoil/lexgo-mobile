import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents, type UserEvent } from "@/shared/realtime";
import { marketSignalOf, type MarketSignal } from "../lib/signal";

// "order_" catches the raw frames TZ §6 names (order_accepted, order_payment_updated …), "order." the dotted ones.
const WATCH = ["marketplace.", "payment.", "order.", "order_", "notification.created"];

// Calls `onSignal` for every user-socket event that concerns a marketplace order.
export function useMarketSignals(onSignal: (s: MarketSignal, e: UserEvent) => void): void {
  useUserEvents(WATCH, (e) => {
    const s = marketSignalOf(e);
    if (s) onSignal(s, e);
    else if (e.event.startsWith("payment.") || e.event.startsWith("order")) onSignal({ kind: "other", orderId: "", workId: "", roomId: "" }, e);
  });
}

// Keeps the order list/history fresh while mounted: a socket event (or a
// reconnect) re-reads them after a short settle time instead of polling.
export function useMarketSync(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refresh = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void qc.invalidateQueries({ queryKey: ["market-orders"] });
      void qc.invalidateQueries({ queryKey: ["market-history"] });
    }, 500);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useMarketSignals(refresh);
  useResync(refresh);
}
