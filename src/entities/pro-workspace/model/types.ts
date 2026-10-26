import type { Dict } from "@/shared/lib/json";

// A new order offered to the professional (response window = confirmationDeadlineAt).
export type SellerOrder = { id: string; title: string; serviceName: string; region: string; budget: string; status: string; createdAt: string; deadline: string };
export type CabinetNote = { id: string; title: string; body: string; createdAt: string };
export type CabinetCase = { id: string; number: string; title: string; stage: string; status: string; nextAction: string; deadlineAt: string };

// GET /lawyers/me/cabinet — one first-load payload for the professional's workspace.
export type Cabinet = {
  accountStatus: string;
  limited: boolean; // pending / unverified: profile + verification only
  limitedReason: string;
  verified: boolean;
  verification: string;
  sellerType: string;
  actions: { acceptOrders: boolean; secureChat: boolean; calls: boolean };
  name: string;
  region: string;
  license: string;
  workload: Dict;
  finance: Dict;
  performance: Dict;
  newOrders: number;
  unread: number;
  cases: CabinetCase[];
  orders: SellerOrder[];
  notes: CabinetNote[];
  clients: number; // distinct clients across the secure chats
  profile: { reviews: number; experienceYears: number; totalCases: number };
};

// GET /lawyers/me/stats (+ a few profile numbers for the "super advokat" criteria).
export type Stats = { workload: Dict; finance: Dict; performance: Dict; experienceYears: number; totalCases: number; reviews: number };

export type Onboarding = { done: number; total: number; status: string };

export type Payout = { id: string; amount: number; status: string; period: string; createdAt: string };
