// The marketplace order flow of TZ.md as the backend reports it. Nothing here is computed on the phone: amounts, percents, deadlines and
// what is allowed all come from the order payload or its sub-resources (financials, checklist, runtime capabilities).

export type CallKind = "audio" | "video";

// What the order itself says about the flow (GET /marketplace/me/orders/{id}). `null` = the backend did not say.
export type FlowOrder = {
  contactUnlocked: boolean | null;
  chatReadOnly: boolean | null;
  callsEnabled: boolean | null;
  callTypes: CallKind[];
  canStart: boolean;
  startUrl: string;
  canComplete: boolean;
  checklistUrl: string;
  financialsUrl: string;
  warrantyUrl: string;
  startedAt: string;
  expectedCompletedAt: string;
  completedAt: string;
  acceptanceDeadlineAt: string; // seller assignment: the absolute backend deadline to accept / decline
  complaint: OrderComplaint;
  warranty: OrderWarranty | null;
  advance: PayPart | null; // the plan of the financial snapshot (advance %, amount)
  final: PayPart | null;
  finalPayment: FinalPayment | null; // the 90% request after completion (final_payment_id / final_amount)
  payment: FinalPayment | null; // the order's current payment (the advance while it waits): its status and a provider link when there is one
  checklistProgress: ChecklistProgress | null;
};

export type PayPart = { percent: number | null; amount: number };
export type FinalPayment = { id: string; amount: number; status: string; url: string };

// The complaint of a finished order: a separate action from the rating, open only in the backend's window.
export type OrderComplaint = { available: boolean; deadlineAt: string; submitted: boolean; id: string; url: string; status: string };
export type OrderWarranty = { status: string; resolution: string; reason: string; decision: string };

// GET …/financials — the payment rows by backend stage/status, the snapshot plan, and (for the seller) commission and settlement.
export type PayKind = "advance" | "final" | "full" | "additional" | "refund" | "other";
export type FinPayment = { id: string; stage: string; kind: PayKind; status: string; amount: number; paid: number; createdAt: string };
export type Financials = {
  gross: number;
  currency: string;
  advance: PayPart | null;
  final: PayPart | null;
  commission: { percent: number | null; platform: number; net: number } | null;
  payments: FinPayment[];
  settlement: string;
  historical: boolean;
};

// GET /marketplace/orders/{id}/checklist
export type CheckStatus = "pending" | "done" | "skipped_with_reason";
export type CheckFile = { id: string; name: string; url: string };
export type CheckItem = {
  id: string;
  title: string;
  clientTitle: string;
  description: string;
  status: CheckStatus;
  required: boolean;
  commentRequired: boolean;
  fileRequired: boolean;
  imageRequired: boolean;
  skipAllowed: boolean;
  comment: string;
  files: CheckFile[];
  images: CheckFile[];
  updatedAt: string;
  sortOrder: number;
};
export type ChecklistProgress = { done: number; total: number; requiredDone: number; requiredTotal: number; percent: number };
export type Checklist = { orderId: string; items: CheckItem[]; progress: ChecklistProgress; snapshotLocked: boolean; uploadRoomId: string; phase: string };

// GET /marketplace/runtime-capabilities — the platform's switches (warranty choices, windows, payment split).
export type WarrantyResolution = "replacement" | "full_refund";
export type RuntimeCaps = {
  advancePercent: number | null;
  finalPercent: number | null;
  providerEnabled: boolean;
  sellerResponseMinutes: number | null;
  ratingWindowMinutes: number | null;
  lowRatingAutoComplaint: boolean;
  warrantyChoices: WarrantyResolution[];
};

// GET …/timeline
export type FlowEvent = { id: string; type: string; status: string; note: string; at: string };

// The order's place in the flow, for the one-line explanation on top of the detail screen.
export type FlowPhase = "assigned" | "advance" | "pending" | "paid" | "in_progress" | "review" | "completed" | "rated" | "cancelled";

export const WARRANTY_KINDS = ["no_response", "sla_breach", "abandoned", "not_delivered", "seller_restricted"] as const;
export type WarrantyKind = (typeof WARRANTY_KINDS)[number];
