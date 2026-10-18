import { completeMarketOrder, marketKeys, type MarketOrder } from "@/entities/order";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { NoteSheet } from "./NoteSheet";

type Props = { order: MarketOrder | null; onClose: () => void };

// POST /marketplace/me/orders/{id}/complete — only when the server lists it for the client.
export function CompleteOrderSheet({ order, onClose }: Props) {
  const { t } = useT();
  const m = useAdminMutation({
    mutationFn: (note: string) => completeMarketOrder(order?.id ?? "", note),
    invalidate: [marketKeys.list, ["market-history"], ["orders"]],
    success: "mk5.completeDone",
    onSuccess: onClose,
  });
  return (
    <NoteSheet visible={!!order} onClose={onClose} title={t("mk5.completeTitle")} lead={t("mk5.completeLead")} label={t("mk5.completeNote")} placeholder={t("mk5.completeNotePh")} confirm={t("mk5.completeConfirm")} busy={m.isPending} onSubmit={(note) => m.mutate(note)} />
  );
}
