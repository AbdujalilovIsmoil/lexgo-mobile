export type Payout = {
  id: string;
  paymentId: string;
  sellerUserId: string;
  gross: number;
  platformFee: number;
  providerFee: number;
  sellerShare: number;
  status: string;
  currency: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Reconciliation = {
  paymentsCount: number;
  paidCount: number;
  gross: number;
  platformFee: number;
  providerFee: number;
  sellerShare: number;
  statuses: Record<string, number>; // payout status → count
  providers: { provider: string; count: number; amount: number }[];
};
