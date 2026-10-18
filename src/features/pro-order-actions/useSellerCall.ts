import { useState } from "react";
import { useRouter } from "expo-router";
import { callPath, startCall, type CallType } from "@/entities/call";
import type { ProOrder } from "@/entities/pro-order";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

// TZ 10: the seller may call the buyer from the order (call_create_url -> POST /chats/{room}/calls), then the call screen opens.
export function useSellerCall(order: ProOrder | undefined) {
  const router = useRouter();
  const { t } = useT();
  const [calling, setCalling] = useState(false);
  const call = async (kind: CallType) => {
    if (calling || !order?.roomId) return;
    setCalling(true);
    try {
      const c = await startCall(order.roomId, kind, order.serviceTitle || order.workId || "LexGo", order.buyerUserId ? [order.buyerUserId] : []);
      router.push(callPath(order.roomId, c.id) as never);
    } catch (e) {
      toast(e instanceof ApiError && e.detail ? e.detail : t("mk7.callError"), "err");
    }
    setCalling(false);
  };
  return { calling, call };
}
