export type Ad = {
  id: string;
  workId: string;
  recordType: string;
  title: string;
  status: string;
  price: number;
  currency: string;
  payload: Record<string, unknown>;
  description: string;
  createdAt: string;
};

// POST body (status defaults to "active"); PATCH takes any subset.
export type AdInput = { title: string; price: number; status?: string; payload: Record<string, unknown> };

export const AD_STATUSES = ["active", "paused", "draft", "expired", "pending", "approved", "rejected", "deleted"];
