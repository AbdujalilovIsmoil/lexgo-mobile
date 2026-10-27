export type PickedDoc = { uri: string; name: string; mime: string; size: number };

export type Risk = { level: "high" | "medium" | "low"; text: string };

// Server price rules (pricing_rule): fee per page band, extra page, urgent surcharge.
export type PricingRule = {
  bands: { min: number; max: number; amount: number }[];
  extraPageAmount: number;
  urgentPercent: number;
  writtenOpinionAmount: number;
};

// POST /ai/document-analysis/quote (and the `pricing` blocks of an analysis).
export type DocQuote = {
  pageCount: number;
  includedPages: number;
  extraPages: number;
  currency: string;
  baseAmount: number;
  ocrAmount: number;
  lawyerReviewAmount: number;
  urgencyAmount: number;
  writtenOpinionAmount: number;
  totalAmount: number;
  paymentRequired: boolean;
  aiIncluded: boolean;
  bandAmount: number;
  rule?: PricingRule;
};

export type DocAnalysis = {
  summary: string;
  analysisText: string;
  risks: Risk[];
  recommendations: string[];
  pointsCount: number;
  pageCount: number;
  pageSource: string;
  fileName?: string;
  pricing?: DocQuote;
  lawyerPricing?: DocQuote;
  upsell?: { title: string; reason: string };
  requiresExtraPayment: boolean;
};

// Approval of an advocate fee over Telegram (nothing reaches an advocate before it).
export type PayGate = { id: string; status: string; amount: number; currency: string; pageCount: number; includedPages: number; extraPages: number; telegramSent: boolean };

// What POST /document-services/review-existing/request answered.
export type HandoffResult = {
  requestId: string;
  workId: string;
  status: string;
  paymentRequired: boolean;
  alreadyExists: boolean;
  gate: PayGate | null;
  message: string;
};

export type DocRequestState = { id: string; workId: string; status: string; paymentRequired: boolean; gate: PayGate | null };

// The upload rule kept until the document service settings arrive, or when they cannot (offline, an error): PDF, DOC(X), TXT to 20 MB.
export const FILE_RULE = { mb: 20, formats: ["pdf", "doc", "docx", "txt"] };
