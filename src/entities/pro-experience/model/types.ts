// TZ.md §13: the seller's experience by category, kept as revisions. A new or edited entry waits for the call center; only verified
// experience counts for pricing and ranking, so a pending edit never changes the verified labels.
export type ExpStatus = "pending_review" | "approved" | "rejected" | "cancelled" | "superseded" | "other";
export type ExpEvidence = { id: string; fileName: string; downloadUrl: string };
export type ExpRecord = {
  id: string;
  rootId: string;
  version: number | null;
  status: ExpStatus;
  categoryId: string;
  subcategoryId: string;
  workplace: string;
  position: string;
  startedAt: string;
  endedAt: string;
  isCurrent: boolean;
  description: string;
  stages: string[];
  results: string[];
  evidence: ExpEvidence[];
  years: number | null;
  rejectionReason: string;
  submittedAt: string;
};
// One experience entry: the verified revision, the one under review and the newest.
export type ExpGroup = { rootId: string; current: ExpRecord | null; pending: ExpRecord | null; latest: ExpRecord | null; revisionCount: number };
export type ExpInput = {
  sourceId: string; // the entry being edited ("" for a new one)
  categoryId: string;
  subcategoryId: string;
  workplace: string;
  position: string;
  startedOn: string; // YYYY-MM-DD
  endedOn: string;
  isCurrent: boolean;
  description: string;
  stages: string[];
  results: string[];
  evidenceIds: string[];
};
export type ExpCategory = { id: string; title: string; children: { id: string; title: string }[] };

export const EXP_STAGES = ["pre_investigation", "investigation", "first_instance", "appeal", "cassation", "supervision", "enforcement", "advisory", "transactional"] as const;
export const EXP_RESULTS = ["full_success", "partial_success", "settlement", "dismissed", "acquittal", "sentence_reduced", "claim_granted", "claim_partially_granted", "defense_success", "other"] as const;
