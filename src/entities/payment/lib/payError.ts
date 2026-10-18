import { useCallback } from "react";
import { useRouter } from "expo-router";
import { ApiError, isPaymentRequired } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic } from "@/shared/lib/haptics";
import { confirmDialog, toast } from "@/shared/ui";

// 503 "integratsiyasi sozlanmagan" / 400 "provider qo'llab-quvvatlanmaydi": the provider is off.
export const isProviderDown = (e: unknown): boolean => e instanceof ApiError && (e.status === 503 || (e.status === 400 && /provider/i.test(e.detail ?? "")));

type T = (key: string) => string;

export function paymentErrorText(e: unknown, t: T): string {
  if (isProviderDown(e)) return t("py2.err.provider");
  if (e instanceof ApiError) {
    if (e.status === 0) return t("common.offline");
    if (e.status === 429) return t("common.rateLimited");
    if (e.detail) return e.detail;
  }
  return t("common.serverError");
}

// One handler for every payment-related failure. 402 (a plan or payment is required) explains
// itself and offers the tariffs; everything else is a toast with the server's own message.
export function usePaymentError(): (e: unknown) => void {
  const { t } = useT();
  const router = useRouter();
  return useCallback(
    (e: unknown) => {
      errorHaptic();
      if (isPaymentRequired(e)) {
        const message = e instanceof ApiError && e.detail ? e.detail : t("py2.need.text");
        confirmDialog({ title: t("py2.need.title"), message, confirmLabel: t("py2.need.cta"), cancelLabel: t("common.close"), icon: "credit-card", onConfirm: () => router.push("/subscription") });
        return;
      }
      toast(paymentErrorText(e, t), "err");
    },
    [t, router],
  );
}
