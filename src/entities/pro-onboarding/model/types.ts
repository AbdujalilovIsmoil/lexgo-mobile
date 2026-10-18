// GET /lawyers/me/cabinet: what a (possibly pending) seller may do right now.
export type ProCabinet = {
  accountStatus: string;
  sellerType: string;
  limitedAccess: boolean;
  limitedReason: string;
  actions: { acceptOrders: boolean; secureChat: boolean; calls: boolean };
  verificationStatus: string;
  verified: boolean;
};

export type OnbStep = { key: string; title: string; required: boolean; completed: boolean };

// GET /seller-onboarding/progress.
export type OnbProgress = {
  status: string;
  completed: number;
  total: number;
  steps: OnbStep[];
  reason: string; // why the review was rejected, when the server says
};

// A proof document the seller uploaded (POST /seller-onboarding/documents).
export type OnbDoc = { id: string; workId: string; name: string; kind: string; status: string; createdAt: string };

// What the status screen shows (TZ 31): pending sellers are not public and cannot sell.
export type OnbState = "incomplete" | "ready" | "submitted" | "approved" | "rejected";
