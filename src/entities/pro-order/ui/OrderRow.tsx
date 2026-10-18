import { RowCard } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import { stageOf } from "../lib/stage";
import type { ProOrder } from "../model/types";
import { OrderStatusPill } from "./OrderStatusPill";

const TINT = { new: "#3B82F6", active: "#06B6D4", completed: "#22C55E", cancelled: "#EF4444", unpaid: "#8A99AC" } as const;

// One order in the seller's queue: service, buyer (name only), price, status.
export function OrderRow({ order: o, onPress }: { order: ProOrder; onPress: () => void }) {
  const { locale } = useT();
  const som = useSom();
  return (
    <RowCard
      icon="shopping-bag"
      tint={TINT[stageOf(o)]}
      title={o.serviceTitle || o.workId}
      subtitle={[o.buyerName, som(o.price)].filter(Boolean).join(" · ")}
      meta={[o.workId, fmtDate(o.createdAt, locale)].filter(Boolean).join(" · ")}
      right={<OrderStatusPill status={o.status} />}
      onPress={onPress}
    />
  );
}
