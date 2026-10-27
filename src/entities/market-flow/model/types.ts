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
  pricing: PriceSnapshot | null; // details.pricing_snapshot: why the order costs what it costs
  resolution: OrderResolution | null; // the call center's offer after no specialist could take the order
  workPhase: WorkPhase; // TZ §14: kept apart from the status — the review stage runs inside `in_progress`
  review: OrderReview | null;
  duration: FlowDuration | null; // the delivery duration set when the work (or its review) started
  clientStatusMessage: string; // the backend's own neutral line for the client (never "a lawyer is being searched")
  waitingReplacement: boolean; // a paid order handed to another seller who has not accepted yet: no seller shown, no chat
  canRequestCancellation: boolean;
};

export type WorkPhase = "reviewing" | "execution" | "";
// The review stage (TZ §6–§7): the seller studies the client's materials before setting the delivery time. Each side gets only its note.
export type OrderReview = { deadlineAt: string; completedAt: string; clientNote: string; sellerNote: string; value: number | null; unit: string };
export type FlowDuration = { value: number; unit: string; calendar: string };

// details.pricing_snapshot ("Transparent price explanation"): the components in the backend's order — they sum to finalPrice, the phone
// never adds them up. Each explains itself in uz / ru / en.
export type PriceComponent = { code: string; optionId: string; amount: number; explanation: Partial<Record<"uz" | "ru" | "en", string>> };
export type PriceSnapshot = { currency: string; components: PriceComponent[]; finalPrice: number; historical: boolean };

// `resolution` of an order in `resolution_required`: the operator offers the client another specialist or a full refund. The choice is
// shown only while `canChoose` is true, with the buttons the offer lists.
export type ResolutionChoice = "reassign" | "refund";
export type ResolutionOffer = { id: string; status: string; options: ResolutionChoice[]; deadlineAt: string; message: string; selected: string };
export type OrderResolution = { canChoose: boolean; offer: ResolutionOffer | null };

export type PayPart = { percent: number | null; amount: number };
export type FinalPayment = { id: string; amount: number; status: string; url: string };

// The complaint of a finished order: a separate action from the rating, open only in the backend's window. After the call center rules
// a valid complaint the work is reopened for a rework (`reworkRequired`, its own deadline and the operator's note).
export type OrderComplaint = {
  available: boolean;
  deadlineAt: string;
  submitted: boolean;
  id: string;
  url: string;
  status: string;
  resolution: string;
  resolutionNote: string;
  reworkRequired: boolean;
  reworkDeadlineAt: string;
  reworkIteration: number;
};
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

// GET …/refund ("Refund state"): pending → processing → succeeded, or failed; not_charged when nothing was paid. `manual` = no payment
// provider runs it (provider_enabled false): an operator approves it by hand.
export type RefundStatus = "pending" | "processing" | "succeeded" | "failed" | "not_charged";
export type OrderRefund = { requestId: string; amount: number; currency: string; status: RefundStatus | string; manual: boolean; updatedAt: string };

// GET …/timeline: one history for the order — status steps, the call center's offer and the choice, cancellation reviews, reassignments
// and refunds (`type`), with who did it when the backend says (`actor`) and the choice or action taken.
export type FlowEvent = { id: string; type: string; status: string; note: string; at: string; actor: string; choice: string };

// The order's place in the flow, for the one-line explanation on top of the detail screen, the badge and the track. `cancelReview` is the
// cancellation review, `reviewing` the seller's review stage, `resolution` the call center's choice for the client, `replacing` a paid
// order waiting for another seller, `attention` a status the app does not know (the call center has it).
export type FlowPhase =
  | "received" | "assigned" | "advance" | "pending" | "paid" | "reviewing" | "in_progress" | "rework" | "cancelReview"
  | "resolution" | "replacing" | "refund" | "refunded" | "completed" | "rated" | "cancelled" | "attention";

export const WARRANTY_KINDS = ["no_response", "sla_breach", "abandoned", "not_delivered", "seller_restricted"] as const;
export type WarrantyKind = (typeof WARRANTY_KINDS)[number];
