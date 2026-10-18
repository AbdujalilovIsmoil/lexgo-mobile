export type MktScope = { status: string; sellerUserId: string; clientUserId: string; dateFrom: string; dateTo: string };

export type MktStats = {
  ordersTotal: number;
  paidOrders: number;
  activeOrders: number;
  completedOrders: number;
  pendingPaymentOrders: number;
  cancelledOrders: number;
  revenuePaid: number;
  sellersCount: number;
  clientsCount: number;
  byStatus: { status: string; count: number }[];
};

export type MktPerson = { id: string; lexgoId: string; role: string; name: string; phone: string; accountStatus: string };

export type MktPayment = {
  workId: string;
  provider: string;
  status: string;
  amount: number;
  paidAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type MktOrder = {
  id: string;
  workId: string;
  orderWorkId: string;
  status: string;
  paymentStatus: string;
  serviceTitle: string;
  sellerType: string;
  price: number;
  currency: string;
  note: string;
  preferredChannel: string;
  preferredTime: string;
  requestedAt: string;
  client: MktPerson;
  seller: MktPerson;
  payment: MktPayment | null;
  roomId: string;
  canCreateCall: boolean;
  createdAt: string;
  updatedAt: string;
};
