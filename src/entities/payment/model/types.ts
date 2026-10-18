// One row of GET /payments (PaymentHistoryOut). The list has no public id (PAY-xxxxx);
// `workId` is only known for payments this session created.
export type PaymentRow = {
  id: string;
  workId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  kind: string;
  description: string;
  orderId: string;
  createdAt: string;
  hasReceipt: boolean;
};

// POST /payments or the `payment` object nested in a purchase/gift answer (PaymentOut).
export type PaymentIntent = {
  id: string;
  workId: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  paymentUrl: string;
};

// GET /payments/{id}/receipt/verify
export type ReceiptCheck = { valid: boolean; status: string; amount: number; paidAmount: number; currency: string; provider: string };

// GET /payments/{id}/split (only some providers support it)
export type PaymentSplit = { gross: number; platformFee: number; sellerShare: number; providerFee: number; currency: string };
