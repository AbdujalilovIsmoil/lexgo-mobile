import { requestPurchase } from "@/entities/order";
import type { LawyerService } from "@/entities/lawyer";
import { quoteService, useServiceOptions } from "@/entities/price-option";
import { NOTE_MAX } from "./purchaseSchema";
import { usePurchaseCore } from "./usePurchaseCore";

export type { Tracked } from "./usePurchaseCore";
export { NOTE_MAX };
export type PurchaseState = ReturnType<typeof usePurchaseCore>;

// The purchase request of one service (POST /marketplace/lawyers/{id}/services/{sid}/purchase-request).
export function usePurchase(lawyerId: string, service: LawyerService, onLogin: () => void) {
  return usePurchaseCore({
    options: useServiceOptions(service.id),
    quote: (ids) => quoteService(service.id, lawyerId, ids),
    send: (v) => requestPurchase(lawyerId, service.id, v),
    onLogin,
  });
}
