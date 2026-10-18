import { ApiError } from "@/shared/api";
import { FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { Skeleton, Text } from "@/shared/ui";
import { useMktLabels, useOrderDetail, type MktOrder, type MktPerson } from "@/entities/admin-marketplace";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { ActivityTimeline } from "./ActivityTimeline";
import { ConfirmCard } from "./ConfirmCard";
import { OrderFacts } from "./OrderFacts";
import { OrderJourney } from "./OrderJourney";
import { OrderTicket } from "./OrderTicket";
import { PartyCard } from "./PartyCard";

type Props = { order: MktOrder | null; onClose: () => void; onSeller: (p: MktPerson) => void; onClient: (p: MktPerson) => void };

// Order detail: ticket, journey, both parties, order/payment facts, Telegram confirms and the activity log.
export function OrderSheet({ order, onClose, onSeller, onClient }: Props) {
  const { t } = useT();
  const label = useMktLabels();
  const kept = useKept(order);
  const q = useOrderDetail(kept?.id ?? "");
  const missing = q.isError && q.error instanceof ApiError && q.error.status === 404;
  const o = q.data?.order.id ? q.data.order : kept;
  const confirms = q.data?.confirms ?? [];
  return (
    <FormSheet visible={!!order} onClose={onClose} title={o ? t("admMktC.title", { id: o.workId || "—" }) : ""} snaps={[0.8, 0.96]}>
      {o ? (
        <>
          <OrderTicket order={o} />
          {missing ? <Text variant="small" tone="warn">{t("admMktC.notFound")}</Text> : null}
          <OrderJourney order={o} confirm={confirms[0]} />
          <PartyCard role={t("admMktC.client")} person={o.client} onOrders={o.client.id ? () => onClient(o.client) : undefined} />
          <PartyCard role={t("admMktC.seller")} person={o.seller} type={label.type(o.sellerType)} onOrders={o.seller.id ? () => onSeller(o.seller) : undefined} />
          <OrderFacts order={o} />
          {missing ? null : (
            <QueryBoundary query={q} skeleton={<Skeleton height={120} round={20} />}>
              {confirms.length ? confirms.map((c) => <ConfirmCard key={c.id || c.createdAt} item={c} />) : <Text variant="small" tone="gray">{t("admMktC.noConfirm")}</Text>}
              <ActivityTimeline rows={q.data?.activity ?? []} />
            </QueryBoundary>
          )}
        </>
      ) : null}
    </FormSheet>
  );
}
