export type PayPhase = "" | "pending" | "paid" | "rejected";
export type PayGate = { phase: PayPhase; status: string; amount: number; currency: string; telegramSent: boolean | null };

export type AssistClient = { id: string; lexgoId: string; role: string; name: string; phone: string; accountStatus: string };
export type AssistCaps = {
  subscriptionCheckout: boolean; documentLawyerRequest: boolean; marketplacePurchaseRequest: boolean;
  urgentAdvokatRequest: boolean | null; supportCall: boolean; operatorTransfer: boolean;
};
export type AssistSub = { id: string; planId: string; status: string; billingPeriod: string; endsAt: string };
export type AssistPending = {
  id: string; workId: string; status: string; planId: string; planSlug: string; planTitle: string; billingPeriod: string;
  months: number; amount: number; currency: string; viaOperator: boolean; createdAt: string;
};
export type AssistDoc = {
  id: string; workId: string; title: string; status: string; requestedType: string; price: number; currency: string;
  paid: boolean; paymentRequired: boolean; gate: PayGate | null; viaOperator: boolean; createdAt: string;
};
export type AddPay = {
  requestId: string; status: string; selectedIds: string[]; amount: number; currency: string; expiresAt: string; createdAt: string; pending: boolean;
};
export type AssistOrder = {
  addPay: AddPay | null; serviceId: string; packageId: string; lawyerUserId: string; id: string; workId: string; title: string; lawyerName: string; status: string; paymentStatus: string;
  price: number; currency: string; viaOperator: boolean; createdAt: string;
};
export type AiTurn = { q: string; a: string; at: string };
export type AiHistory = { turns: AiTurn[]; sessionId: string };

export type AssistContext = {
  client: AssistClient | null;
  caps: AssistCaps;
  subs: AssistSub[];
  pending: AssistPending[];
  docs: AssistDoc[];
  orders: AssistOrder[];
  ai: AiHistory;
};

export type AssistBlock = "closed" | "notClient" | "notAssigned" | "missing" | "unavailable";
