// TZ.md Gaps Closed §3: the seller's experience by category, kept as revisions. A new or edited entry waits for the call center; only
// approved experience counts for pricing and ranking (§3.14), so a pending, rejected or cancelled revision never changes the verified labels.
export type ExpStatus = "pending_review" | "approved" | "rejected" | "cancelled" | "superseded" | "other";
export type ExpEvidence = { id: string; fileName: string; mime: string; size: number; downloadUrl: string };
// One position held at the workplace (contract §15). Periods may overlap or run in parallel: the backend merges them for the rating.
export type ExpPosition = { title: string; startedAt: string; endedAt: string; isCurrent: boolean; description: string };
export type ExpRecord = {
  id: string;
  rootId: string;
  version: number | null;
  status: ExpStatus;
  categoryId: string;
  subcategoryId: string;
  workplace: string;
  positions: ExpPosition[]; // newest first; a record without `positions` gives its legacy single position
  description: string;
  stages: string[];
  results: string[];
  evidence: ExpEvidence[];
  years: number | null;
  rejectionReason: string;
  submittedAt: string;
  affectsPricing: boolean; // affects_pricing; without the flag, an approved revision counts
};
// One experience entry: the verified revision, the one under review and the newest.
export type ExpGroup = { rootId: string; current: ExpRecord | null; pending: ExpRecord | null; latest: ExpRecord | null; revisionCount: number };
export type ExpPositionInput = {
  key: string; // the form's own row key, never sent
  title: string;
  startedOn: string; // YYYY-MM-DD
  endedOn: string;
  isCurrent: boolean;
  description: string;
};
export type ExpInput = {
  sourceId: string; // the entry being edited ("" for a new one)
  categoryId: string;
  subcategoryId: string;
  workplace: string;
  positions: ExpPositionInput[]; // 1 to EXP_POSITIONS_MAX
  description: string;
  stages: string[];
  results: string[];
  evidenceIds: string[];
};
export const EXP_POSITIONS_MAX = 30; // ExperienceSubmission.positions maxItems
export type ExpCategory = { id: string; title: string; children: { id: string; title: string }[] };

// GET …/experience/{id}/history (§3.8): every revision and every call-center decision with its checklist.
export type ExpCheck = { key: string; verdict: string; note: string };
export type ExpReview = { id: string; experienceId: string; decision: "approved" | "rejected" | "other"; reason: string; checklist: ExpCheck[]; reviewedAt: string };
export type ExpHistory = { rootId: string; revisions: ExpRecord[]; reviews: ExpReview[] };

export const EXP_STAGES = ["pre_investigation", "investigation", "first_instance", "appeal", "cassation", "supervision", "enforcement", "advisory", "transactional"] as const;
export const EXP_RESULTS = ["full_success", "partial_success", "settlement", "dismissed", "acquittal", "sentence_reduced", "claim_granted", "claim_partially_granted", "defense_success", "other"] as const;
// The reviewer's checklist (§3.11); a key outside this list is shown as the backend wrote it.
export const EXP_CHECKS = ["identity_license", "workplace_position", "dates_duration", "category_relevance", "court_investigation_evidence", "duplicates_conflicts", "file_authenticity", "category_test", "verifier_conclusion"] as const;
