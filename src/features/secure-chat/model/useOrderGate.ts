import { useAccess } from "@/entities/access";
import { callTypesOf, chatModeOf, phaseOf, type CallKind } from "@/entities/market-flow";
import { orderPhase, useMarketOrder } from "@/entities/order";
import { useProOrder } from "@/entities/pro-order";
import type { Room } from "@/entities/secure-chat";

export type OrderGate = { known: boolean; write: boolean; calls: CallKind[] };
const OPEN: OrderGate = { known: false, write: true, calls: ["audio", "video"] };

// The chat of a marketplace order follows the order's own gates (TZ §8, the cancellation contract §15): nothing new while the order made
// the room read-only (finished, being refunded, reassigned) or contact is still locked, only the call types the order allows, and an
// earlier room of a reassigned order stays readable only. Rooms without an order — or an order this user cannot read — keep the room's
// own rules (the backend enforces them either way).
export function useOrderGate(room: Room | undefined): OrderGate {
  const seller = useAccess().seller;
  const orderId = room?.orderId ?? "";
  const client = useMarketOrder(orderId, !!orderId && !seller);
  const pro = useProOrder(seller ? orderId : "");
  if (!room || !orderId) return OPEN;
  if (seller) {
    const o = pro.data;
    if (!o) return OPEN;
    const view = { roomId: o.roomId, canStartChat: o.canChat, canCreateCall: o.canCall, flow: o.flow };
    const phase = phaseOf({ status: o.status, paymentStatus: o.paymentStatus, flow: o.flow, rated: o.rating.stars > 0 });
    const here = o.roomId === room.id;
    return { known: true, write: here && chatModeOf(view, phase) === "open", calls: here ? callTypesOf(view, phase) : [] };
  }
  const o = client.data;
  if (!o) return OPEN;
  const phase = orderPhase(o);
  const here = o.roomId === room.id;
  return { known: true, write: here && chatModeOf(o, phase) === "open", calls: here ? callTypesOf(o, phase) : [] };
}
