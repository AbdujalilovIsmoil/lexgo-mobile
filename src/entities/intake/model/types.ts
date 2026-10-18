export type LegalSource = { key: string; title: string; url: string; trustLevel: string };

// One of up to three matched services (basic / standard / premium) with the passport facts shown on the card.
export type IntakeOffer = {
  level: string;
  serviceId: string;
  title: string;
  price?: number;
  days: number;
  docsCount: number;
  advokatRequired: boolean;
};

// POST /ai/classify — the problem is classified and a lead is created for the call center.
export type Classification = {
  category: string;
  executorType: string;
  urgency: string;
  summary: string;
  recommendedService: string;
  leadId?: string;
  offers: IntakeOffer[];
  sources: LegalSource[];
  disclaimer: string;
  answerStatus: string;
};

export const URGENT_LEVELS = new Set(["urgent", "high", "critical"]);
export const MIN_PROBLEM_CHARS = 8;
