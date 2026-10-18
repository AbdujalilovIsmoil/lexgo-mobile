import type { UserHit } from "./types";

// One person of the admin directory (GET /admin/users/{id}).
export type UserDetail = UserHit & { firstName: string; lastName: string; middleName: string; referralCode: string; referredBy: string; phoneVerified: boolean };

export type UserEdit = { firstName: string; lastName: string; middleName: string; status: string };

export type C360Row = { id: string; title: string; subtitle: string; status: string; amount: number; date: string };
export type C360Summary = { orders: number; cases: number; payments: number; spent: number; leads: number; rooms: number; complaints: number; reviews: number };
// GET /admin/clients/{id}/360 — everything the platform knows about one client, in one call.
export type Client360 = {
  client: UserDetail; summary: C360Summary;
  orders: C360Row[]; cases: C360Row[]; payments: C360Row[]; leads: C360Row[]; complaints: C360Row[]; reviews: C360Row[];
  subscriptions: C360Row[]; activities: C360Row[]; rooms: number;
};
