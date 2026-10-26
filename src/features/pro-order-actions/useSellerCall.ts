import type { ProOrder } from "@/entities/pro-order";
import { useRoomCall } from "@/features/secure-chat";

// TZ §8: the seller calls the buyer from the order through the room's own call flow — a call already running in the room is joined
// instead of a second one being started, and the buyer is invited with it.
export function useSellerCall(order: ProOrder | undefined) {
  const room = useRoomCall(order?.roomId ?? "", order?.serviceTitle || order?.workId || "LexGo", "", order?.buyerUserId ? [order.buyerUserId] : []);
  return { calling: room.busy, call: (kind: "audio" | "video") => (order?.roomId ? room.begin(kind) : Promise.resolve()) };
}
