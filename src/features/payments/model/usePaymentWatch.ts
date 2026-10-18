import { useEffect, useRef } from "react";
import { isPendingStatus, phaseOf, usePayments, type PaymentRow, type PayPhase } from "@/entities/payment";
import { useSocketState } from "@/shared/realtime";
import { successHaptic } from "@/shared/lib/haptics";

type Watch = { payment: PaymentRow | null; phase: PayPhase | null; pending: boolean; refreshing: boolean; refresh: () => void };

// Follows one payment until the backend settles it (TZ 27): the list is refetched when the
// socket pushes a change (usePaymentSync), and — only while the socket is down — every 15 s.
// `onPaid` fires once when the backend turns it paid; the client never sets "paid" itself.
export function usePaymentWatch(paymentId: string | null, onPaid?: (p: PaymentRow) => void): Watch {
  const { data, refetch, isFetching } = usePayments();
  const socket = useSocketState();
  const payment = (paymentId && data?.find((p) => p.id === paymentId)) || null;
  const pending = !!payment && isPendingStatus(payment.status);
  const missing = !!paymentId && !!data && !payment;
  useEffect(() => {
    if (missing) void refetch();
  }, [missing, refetch]);
  useEffect(() => {
    if (!pending || socket === "online") return;
    const id = setInterval(() => void refetch(), 15000);
    return () => clearInterval(id);
  }, [pending, socket, refetch]);
  const seen = useRef<string | null>(null);
  const cb = useRef(onPaid);
  useEffect(() => {
    cb.current = onPaid;
  });
  useEffect(() => {
    if (!payment) return;
    const was = seen.current;
    seen.current = payment.status;
    if (was !== null && was !== payment.status && phaseOf(payment) === "paid") {
      successHaptic();
      cb.current?.(payment);
    }
  }, [payment]);
  return { payment, phase: payment ? phaseOf(payment) : null, pending, refreshing: isFetching, refresh: () => void refetch() };
}
