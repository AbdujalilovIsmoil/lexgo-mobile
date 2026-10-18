export type UrgentPerson = { id: string; name: string; phone: string; role: string; lexgoId: string };
export type UrgentFile = { id: string; name: string; url: string; size: number; contentType: string; seconds: number; voice: boolean };
export type UrgentSource = { type: string; id: string; status: string; title: string; createdAt: string };
export type UrgentStep = { from: string; to: string; at: string };

// The 15-minute rating window the backend opens when the work is completed. `available && !submitted` is the truth.
export type UrgentRating = {
  deadlineAt: string;
  available: boolean;
  submitted: boolean;
  value: number;
  remainingSeconds: number;
  closedReason: string; // expired | submitted | not_ready
};

// What a payment/approval step of the record says, when the backend sends one (never decided on the client).
export type UrgentPayment = { status: string; amount: number; provider: string };

export type UrgentCandidate = {
  userId: string;
  name: string;
  role: string;
  region: string;
  specializations: string[];
  rating: number;
  reviewsCount: number;
  successRate: number;
  workload: number;
  directionMatch: boolean;
  external: boolean;
  callcenter: boolean;
  score: number;
};

export type GroupInput = { lawyerUserIds: string[]; scheduledAt?: string; note?: string; allowCount?: boolean; allowDirection?: boolean };
export type AssignRefusal = { kind: "count" | "direction" | "minimum"; requested: number; selected: number; count: number } | null;
