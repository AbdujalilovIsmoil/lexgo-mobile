import { cancelMarketOrder, marketKeys, type MarketOrder } from "@/entities/order";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { NoteSheet } from "./NoteSheet";

type Props = { order: MarketOrder | null; onClose: () => void };

// POST /marketplace/me/orders/{id}/cancel — only offered while the payment is unconfirmed.
export function CancelOrderSheet({ order, onClose }: Props) {
  const { t } = useT();
  const m = useAdminMutation({
    mutationFn: (note: string) => cancelMarketOrder(order?.id ?? "", note),
    invalidate: [marketKeys.list, ["market-history"], ["orders"]],
    success: "mk5.cancelDone",
    onSuccess: onClose,
  });
  return (
    <NoteSheet visible={!!order} onClose={onClose} title={t("mk5.cancelTitle")} lead={t("mk5.cancelLead")} label={t("mk5.reason")} placeholder={t("mk5.reasonPh")} confirm={t("mk5.cancelConfirm")} danger busy={m.isPending} onSubmit={(note) => m.mutate(note)} />
  );
}
