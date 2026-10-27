import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { payKeys } from "@/entities/payment";
import { entitlementKeys, featureKeys } from "@/entities/plan";
import { useResync, useUserEvents } from "@/shared/realtime";

// Anything on /ws/users/me that can change a payment, a plan or a gift.
const EVENTS = ["payment.", "payments.", "subscription.", "gift.", "order.", "document_request.payment", "support.assist_subscription_checkout_created", "notification.created"];

// Mounted once (PayMounts): a socket event refetches payments and entitlements — screens
// never poll while the socket is up (TZ 37). Debounced: one answer per burst of events.
// A subscription event (activated, renewed, `renewal_consent_required`) also rereads the plan's features and contracts; their
// start / resume / reconnect reads are MarketMounts'.
export function usePaymentSync(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const plan = useRef(false);
  const refresh = useCallback((e?: { event: string }) => {
    if (e?.event.startsWith("subscription")) plan.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void qc.invalidateQueries({ queryKey: payKeys.list });
      void qc.invalidateQueries({ queryKey: entitlementKeys.all });
      void qc.invalidateQueries({ queryKey: ["gifts"] });
      if (!plan.current) return;
      plan.current = false;
      void qc.invalidateQueries({ queryKey: featureKeys.mine });
      void qc.invalidateQueries({ queryKey: featureKeys.contracts });
    }, 500);
  }, [qc]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents([...EVENTS, "subscription_"], refresh);
  useResync(refresh);
}
