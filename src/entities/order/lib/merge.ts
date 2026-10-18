import { serviceStageOf } from "./serviceStage";
import { marketStageOf } from "./stage";
import type { MarketOrder, MarketStage } from "../model/marketTypes";
import type { Order } from "../model/types";

// One row of "My orders": a marketplace purchase (/marketplace/me/orders) or a
// service order (/orders) that is not a marketplace one.
export type OrderEntry =
  | { kind: "market"; key: string; at: string; stage: MarketStage; order: MarketOrder }
  | { kind: "service"; key: string; at: string; stage: MarketStage; order: Order };

// /marketplace/me/orders is the authority for marketplace purchases (ADV number,
// chat, payment); /orders repeats them under an ORD number, so those copies are dropped.
export function mergeOrders(market: MarketOrder[], service: Order[]): OrderEntry[] {
  const ids = new Set(market.map((o) => o.id));
  const rows: OrderEntry[] = [
    ...market.map((order): OrderEntry => ({ kind: "market", key: `m-${order.id}`, at: order.createdAt, stage: marketStageOf(order), order })),
    ...service.filter((o) => !ids.has(o.id) && (o.source ?? "") !== "marketplace").map((order): OrderEntry => ({ kind: "service", key: `s-${order.id}`, at: order.createdAt, stage: serviceStageOf(order), order })),
  ];
  return rows.sort((a, b) => (b.at > a.at ? 1 : -1));
}

export const entryText = (e: OrderEntry): string =>
  e.kind === "market" ? [e.order.workId, e.order.serviceTitle, e.order.lawyerName].join(" ") : [e.order.workId, e.order.title, e.order.serviceName, e.order.lawyerName ?? ""].join(" ");
