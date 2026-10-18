import type { MktOrder } from "./types";

export type MktDelivery = { chatId: string; ok: boolean; error: string };

export type MktConfirm = {
  id: string;
  status: string;
  serviceTitle: string;
  categoryTitle: string;
  amount: number;
  deliveries: MktDelivery[];
  reviewedByChatId: string;
  reviewedAt: string;
  createdAt: string;
};

export type MktActivity = { id: string; action: string; title: string; detail: string; ip: string; outcome: string; createdAt: string };

export type MktOrderDetail = { order: MktOrder; confirms: MktConfirm[]; activity: MktActivity[] };

export type MktSeller = {
  userId: string;
  lexgoId: string;
  name: string;
  phone: string;
  accountStatus: string;
  sellerType: string;
  region: string;
  district: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  verificationStatus: string;
  servicesCount: number;
  ordersTotal: number;
  activeOrders: number;
  pendingPaymentOrders: number;
  completedOrders: number;
  paidOrders: number;
  revenuePaid: number;
  lastOrderAt: string;
};
