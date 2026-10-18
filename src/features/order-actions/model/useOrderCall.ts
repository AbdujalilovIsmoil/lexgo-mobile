import { useState } from "react";
import { useRouter } from "expo-router";
import { callPath, startCall, type CallType } from "@/entities/call";
import type { MarketOrder } from "@/entities/order";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

// Same request as the web's order card: POST /chats/{room}/calls inviting the seller, then the call screen.
export function useOrderCall(order: MarketOrder) {
  const router = useRouter();
  const { t } = useT();
  const [calling, setCalling] = useState<CallType | "">("");
  const call = async (kind: CallType) => {
    if (calling || !order.roomId) return;
    setCalling(kind);
    try {
      const c = await startCall(order.roomId, kind, order.serviceTitle || order.workId || "LexGo", order.lawyerUserId ? [order.lawyerUserId] : []);
      router.push(callPath(order.roomId, c.id) as never);
    } catch (e) {
      toast(e instanceof ApiError && e.detail ? e.detail : t("mk7.callError"), "err");
    }
    setCalling("");
  };
  return { calling, call };
}
