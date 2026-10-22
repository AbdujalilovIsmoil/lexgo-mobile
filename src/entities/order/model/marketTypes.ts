import type { Quote } from "@/entities/price-option";
// pending = waiting for the payment approval, active = paid and in work.
export type MarketStage = "pending" | "active" | "completed" | "cancelled";
export type PreferredChannel = "chat" | "audio" | "video" | "meeting";
export const PREFERRED_CHANNELS: PreferredChannel[] = ["chat", "audio", "video", "meeting"];

// The 15-minute rating window of a completed order, as the backend reports it (`rating`). `fetchedAt` anchors remainingSeconds.
export type OrderRating = { available: boolean; closed: boolean; reason: string; deadlineAt: string; remainingSeconds: number; fetchedAt: number };
// A supplemental payment the seller asked for (details.additional_payment_request_id + the payment of that request).
export type OrderAddPay = { id: string; status: string; amount: number; total: number; expiresAt: string };
export type ResultFile = { name: string; path: string; id: string };
// What was bought: the package snapshot taken at purchase time (details.package_snapshot).
export type PackageSnap = { title: string; code: string; price: number; components: number; customItems: { title: string; description: string; required: boolean }[]; included: string[]; excluded: string[] };

// One marketplace purchase of the signed-in client (GET /marketplace/me/orders).
export type MarketOrder = {
  id: string;
  workId: string; // the number the client sees (ADV-…)
  status: string;
  paymentStatus: string;
  serviceTitle: string;
  price: number;
  currency: string;
  note: string;
  preferredChannel: string;
  preferredTime: string;
  lawyerName: string;
  lawyerPublicId: string;
  lawyerUserId: string;
  roomId: string; // secure chat room, "" until the payment is approved
  canStartChat: boolean;
  canCreateCall: boolean;
  cancelOffered: boolean; // the backend sends cancel_url on EVERY order — see lib/actions.ts
  completeOffered: boolean; // `complete` is listed in client_actions (today only sellers get it)
  createdAt: string;
  requestedAt: string;
  paidAt: string; // when the payment was approved ("" while unpaid)
  updatedAt: string;
  quote: Quote | null; // details.option_quote: the selected options and what each added (the total is the backend's)
  pack: PackageSnap | null;
  resultText: string;
  resultFiles: ResultFile[];
  rating: OrderRating | null;
  ratingUrl: string;
  ratingSubmitted: boolean;
  ratingStars: number; // what the client gave (details.rating), 0 if nothing yet
  ratingComment: string;
  addPay: OrderAddPay | null;
  secondOpinionUrl: string; // second_opinion_promotion_url / actions.second_opinion_promotion; "" (null) → the promotion is not rendered
};

// What POST …/purchase-request answers with.
export type MarketPurchase = { orderId: string; workId: string; status: string; amount: number; currency: string; telegramSent: boolean };

// A purchase-request that hit 409 marketplace_order_already_active.
export type ActivePurchase = { orderId: string; workId: string; status: string };

export type StatusEntry = { status: string; note: string; at: string };
