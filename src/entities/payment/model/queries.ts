import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getPaymentSplit, verifyReceipt } from "../api/intentApi";
import { listMyPayouts } from "../api/payoutApi";
import { listPayments } from "../api/paymentApi";

export const payKeys = {
  list: ["pay-list"] as const,
  verify: (id: string) => ["pay-verify", id] as const,
  split: (id: string) => ["pay-split", id] as const,
};

export function usePayments() {
  const authed = useIsAuthed();
  return useQuery({ queryKey: payKeys.list, queryFn: listPayments, enabled: authed, staleTime: 30 * 1000 });
}

// There is no GET /payments/{id}: one payment is read out of the list.
export function usePayment(id: string) {
  const q = usePayments();
  const payment = q.data?.find((p) => p.id === id) ?? null;
  return { ...q, payment };
}

export const usePaymentVerify = (id: string, enabled = true) =>
  useQuery({ queryKey: payKeys.verify(id), queryFn: () => verifyReceipt(id), enabled: enabled && !!id, staleTime: 60 * 1000, retry: false });

// 400/503 mean "this provider has no split" — a normal answer, not worth retrying.
export const usePaymentSplit = (id: string, enabled = true) =>
  useQuery({ queryKey: payKeys.split(id), queryFn: () => getPaymentSplit(id), enabled: enabled && !!id, staleTime: 5 * 60 * 1000, retry: false });

export const usePayouts = (enabled: boolean) => useQuery({ queryKey: ["pay-payouts"], queryFn: listMyPayouts, enabled, staleTime: 60 * 1000 });
