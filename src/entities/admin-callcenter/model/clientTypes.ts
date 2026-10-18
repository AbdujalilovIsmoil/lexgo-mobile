import type { CcClient } from "./types";

export type CardOrder = { id: string; workId: string; title: string; status: string; lawyerName: string; createdAt: string };
export type CardCase = { id: string; workId: string; title: string; stage: string; status: string; createdAt: string };
export type CardPayment = { id: string; amount: number; status: string; kind: string; description: string; createdAt: string };
export type CardLead = { id: string; category: string; source: string; region: string; status: string; createdAt: string };
export type CardActivity = { id: string; action: string; detail: string; createdAt: string };
export type CardSub = { id: string; planId: string; status: string; startsAt: string; endsAt: string };
export type CardComplaint = { id: string; workId: string; title: string; status: string; createdAt: string };
export type CardFamily = { id: string; name: string; phone: string; relation: string };

// GET /call-center/clients/{id} (or /admin/clients/{id}/360): profile, totals and the client's works, payments,
// subscriptions, leads, complaints and last actions.
export type ClientCard = {
  client: CcClient & { referralCode: string; createdAt: string };
  summary: { orders: number; spent: number; leads: number; rooms: number; complaints: number; subscriptions: number; payments: number; cases: number };
  orders: CardOrder[];
  cases: CardCase[];
  payments: CardPayment[];
  leads: CardLead[];
  activities: CardActivity[];
  subs: CardSub[];
  complaints: CardComplaint[];
  family: CardFamily[];
};
