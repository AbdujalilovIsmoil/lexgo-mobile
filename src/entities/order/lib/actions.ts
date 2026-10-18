import { marketStageOf } from "./stage";
import type { MarketOrder } from "../model/marketTypes";

// The backend sends cancel_url on every order (even paid, completed or already
// cancelled ones), so the link alone does not mean "allowed": a client may cancel
// only while the payment is still waiting for approval, like on the web.
export const canCancelOrder = (o: MarketOrder): boolean => o.cancelOffered && marketStageOf(o) === "pending";

// Confirming the work is the seller's step (TZ 18); the button appears only if
// the server lists `complete` among the client's actions and the order is in work.
export const canCompleteOrder = (o: MarketOrder): boolean => o.completeOffered && marketStageOf(o) === "active";

// The ADV-… number is shown; the UUID never is.
export const orderNumber = (o: MarketOrder): string => o.workId || "—";
