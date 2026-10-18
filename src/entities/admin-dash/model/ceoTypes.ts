import type { Point } from "./types";

export type GiftKpis = {
  giftPurchases: number;
  giftActivationRate: number;
  recipientConversion: number;
  giftToPaidConversion: number;
  averageGiftValue: number;
  referralRate: number;
  giftCac: number;
  giftLtv: number;
};
export type Channel = { name: string; leads: number; pct: number; payments: number; revenue: number };

// GET /analytics/ceo
export type Ceo = {
  revenue: number; revenueDeltaPct: number; mrr: number;
  users: number; activeUsers: number; conversionPct: number;
  funnel: Point[]; channels: Channel[]; revenueTrend: Point[];
  mau: number; dau: number; gmv: number; arr: number; arpu: number; takeRate: number;
  cac: number; cacClient: number; cacAdvocate: number; ltv: number; ltvCac: number; paybackMonths: number;
  npsClient: number; npsAdvocate: number;
  newClients: number; newAdvocates: number; newLawyers: number; paidPayments: number;
  giftKpis: GiftKpis;
};
