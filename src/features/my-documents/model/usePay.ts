import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { openUrl } from "@/shared/lib/links";
import { createPayment, docKeys, type MyDoc } from "@/entities/my-document";

// Ask the server for a payment link and open it; "paid" only ever comes back from the server (TZ 27/45).
export function usePay(doc: Pick<MyDoc, "id" | "price">) {
  const { t } = useT();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => createPayment(doc.id, doc.price),
    onSuccess: (r) => { void qc.invalidateQueries({ queryKey: docKeys.all }); toast(t("dm5.payCreated"), "info"); if (r.url) openUrl(r.url); },
    onError: (e) => toast(e instanceof ApiError && e.detail ? e.detail : t("dm5.payFail"), "err"),
  });
}
