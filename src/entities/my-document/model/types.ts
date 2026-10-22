// A client's document request ("Mening hujjatlarim"), as the app uses it.
export type DocMode = "manual" | "ai" | "lawyer";

export type DocRating = {
  available: boolean;
  submitted: boolean;
  value: number;
  comment: string;
  deadlineAt: string;
  remainingSeconds: number;
  closedReason: string;
};

export type DocGate = { status: string; amount: number; currency: string; pageCount: number; includedPages: number; extraPages: number; telegramSent: boolean };
export type CtorAction = { available: boolean; promptRequired: boolean; title: string; message: string };

// One row of the list: built from service-flow (rich) or from the light list (search results).
export type DocRow = {
  id: string;
  workId: string;
  title: string;
  status: string;
  statusLabel: string;
  mode: DocMode;
  price: number;
  currency: string;
  requestedType: string;
  createdAt: string;
  updatedAt: string; // the backend orders the list by it: shown, never re-sorted
  templateId: string;
  fileReady: boolean;
  format: string;
  lawyer: string;
  nextAction: string;
  meeting: string;
  rating: DocRating;
  lawyerActive: boolean;
  canSend: boolean;
  blockReason: string;
  ctor: CtorAction | null;
  paymentRequired: boolean;
};

export type DocPage = { items: DocRow[]; total: number; hasMore: boolean };
export type DocFilters = { mode: "" | DocMode; status: string };
