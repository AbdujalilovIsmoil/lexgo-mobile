import type { FlowOrder } from "@/entities/market-flow";
import type { AdditionalPay, OrderRating, OrderResult, PackSnap, QuoteSnap } from "./extraTypes";

// A marketplace order as its seller sees it (GET /marketplace/me/orders?role_view=seller).
// The buyer's phone is deliberately not part of the model (TZ 18: contact stays hidden).
export type ProOrder = {
  id: string;
  workId: string; // ADV-… public id
  status: string;
  paymentStatus: string;
  serviceId: string;
  serviceTitle: string;
  price: number;
  currency: string;
  note: string;
  preferredChannel: string;
  preferredTime: string;
  buyerName: string;
  buyerPublicId: string; // LGC-… (never the UUID)
  buyerUserId: string;
  roomId: string;
  canChat: boolean;
  canComplete: boolean;
  canCall: boolean;
  packageId: string;
  optionIds: string[]; // the Studio options the client bought (selected_option_ids)
  quote: QuoteSnap;
  pack: PackSnap | null;
  result: OrderResult;
  rating: OrderRating;
  additional: AdditionalPay | null;
  createdAt: string;
  updatedAt: string;
  flow: FlowOrder; // TZ.md: assignment deadline, start / checklist / financials links, contact gate, payment plan
};

// new = paid and waiting for the seller · active = being worked on · done · closed.
export type OrderStage = "new" | "active" | "completed" | "cancelled" | "unpaid";
export type StageTab = "all" | Exclude<OrderStage, "unpaid">;

export type OrderStep = { status: string; note: string; at: string };
export type Milestone = { id: string; index: number; title: string; percent: number; amount: number; currency: string; status: string };
