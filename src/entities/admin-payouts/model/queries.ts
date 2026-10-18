import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getReconciliation, listPayouts, updatePayout } from "../api/payoutApi";

export const payoutKeys = { all: ["admin-payouts"] as const };

export const useReconciliation = () => useQuery({ queryKey: [...payoutKeys.all, "reconciliation"], queryFn: getReconciliation });
export const usePayouts = (status: string) => useQuery({ queryKey: [...payoutKeys.all, "list", status], queryFn: () => listPayouts(status) });

// Mark a payout as paid; both the list and the reconciliation numbers are refetched.
export const useMarkPaid = () =>
  useAdminMutation({ mutationFn: ({ id, note }: { id: string; note: string }) => updatePayout(id, "paid", note), invalidate: [payoutKeys.all], success: "admPay.paidDone" });
