import { useState } from "react";
import type { CallType } from "@/entities/call";
import type { MarketOrder } from "@/entities/order";
import { useRoomCall } from "@/features/secure-chat";

// The order's call buttons (TZ §8) go through the room's own call flow: a call already running in the order's room is joined instead of
// a second one being started, and the seller is invited with it. `calling` names the button that is busy.
export function useOrderCall(order: MarketOrder) {
  const room = useRoomCall(order.roomId, order.serviceTitle || order.workId || "LexGo", "", order.lawyerUserId ? [order.lawyerUserId] : []);
  const [kind, setKind] = useState<CallType | "">("");
  const call = async (k: CallType) => {
    if (!order.roomId) return;
    setKind(k);
    await room.begin(k);
    setKind("");
  };
  return { calling: room.busy ? kind : "", call };
}
