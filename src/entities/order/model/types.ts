export type Order = {
  id: string;
  workId: string;
  title: string;
  serviceName: string;
  status: string;
  paymentStatus: string;
  region: string;
  amount?: number;
  createdAt: string;
  lawyerName?: string;
  source?: string;
  acceptanceDeadlineAt?: string; // an assignment to a seller: the backend's absolute answer deadline (TZ.md §5)
};

export const ORDER_STATUS_TONE: Record<string, "ok" | "warn" | "gray" | "blue" | "err"> = {
  new: "warn",
  pending: "warn",
  pending_payment: "warn",
  sent_to_seller: "blue",
  created: "warn",
  accepted: "blue",
  paid: "ok",
  started: "blue",
  in_progress: "blue",
  result_ready: "ok",
  completed: "ok",
  closed: "gray",
  declined: "err",
  rejected: "err",
  cancelled: "err",
};

export type PaymentPolicy = { orderId: string; price: number; advancePercent: number; advanceAmount: number; paidAmount: number; remainingToUnlock: number; contactUnlocked: boolean; currency: string };

export type PriceModifier = { key: string; label: string; percent?: number; amount?: number; multiplier?: number };
export type PriceQuote = {
  baseAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  subtotal?: number;
  referralPercent?: number;
  modifiers: PriceModifier[];
};

export type PaymentIntent = { id: string; status: string; paymentUrl?: string };
