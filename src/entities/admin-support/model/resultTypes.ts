import type { PayGate } from "./assistTypes";

export type PlanPreview = { planSlug: string; months: number; amount: number; currency: string; baseAmount: number; subtotal: number; discountPercent: number; discountAmount: number };
export type PlanCheckout = { id: string; workId: string; status: string; paymentId: string; planId: string; planSlug: string; amount: number; currency: string; telegramSent: boolean };
export type DocResult = {
  requestId: string; recordId: string; workId: string; status: string; poolStatus: string; title: string; price: number; currency: string;
  paid: boolean; paymentRequired: boolean; telegramSent: boolean; gate: PayGate | null; assignmentMode: string;
};
export type MarketResult = {
  workId: string; orderId: string; paymentId: string; requestId: string; status: string; orderStatus: string; paymentStatus: string;
  nextStatus: string; amount: number; currency: string; telegramSent: boolean; sellerAfterPayment: boolean; serviceTitle: string; lawyerName: string; gate: PayGate | null;
};
export type UrgentResult = {
  id: string; workId: string; status: string; serviceKind: string; channel: string; amount: number; currency: string; immediateCall: boolean;
  telegramSent: boolean; lawyerName: string; clientNotified: boolean | null; paymentRequired: boolean; gate: PayGate | null;
};

// What a finished assist action leaves on screen (one result card per action).
export type AssistSent =
  | { kind: "plan"; key: string; data: PlanCheckout; planName: string; period: string; subsBefore: string[]; at: number }
  | { kind: "doc"; key: string; data: DocResult }
  | { kind: "market"; key: string; data: MarketResult }
  | { kind: "urgent"; key: string; data: UrgentResult };
