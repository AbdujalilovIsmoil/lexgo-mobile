export type ActiveSub = { id: string; planId: string; startsAt: string; endsAt: string; familyCount: number };
export type SharedMember = { id: string; name: string; phone: string; relation: string };
export type PlanRequestRow = { id: string; workId: string; planTitle: string; planId: string; period: string; amount: number; currency: string; status: string; createdAt: string; paymentId: string };

// GET /clients/me/entitlements, as the app reads it. The first five fields keep the shape other
// screens already use; the rest feeds the "what my plan gives" page.
export type Entitlements = {
  active: boolean;
  endsAt: string;
  planIds: string[];
  pendingRequests: number;
  templates: boolean;
  subs: ActiveSub[];
  shared: SharedMember[];
  aiLimit: string;
  docs: { templates: boolean; download: boolean; fill: boolean; source: string };
  pending: PlanRequestRow[];
};
