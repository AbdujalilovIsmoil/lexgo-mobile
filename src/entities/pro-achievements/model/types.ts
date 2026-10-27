// Marketplace Enterprise contract §17: the seller's achievements. A new one waits for the call center; pending or rejected ones never
// count for the rating, and the public list carries only the safe fields (type, title, date, category name).
export const ACH_TYPES = ["court_dispute_result", "pretrial_resolution", "mediation_settlement", "corporate_transaction", "tax_customs", "intellectual_property", "state_body_appeal", "labor_hr", "compliance_audit", "publication_research", "qualification_certification", "award_recognition", "pro_bono", "other"] as const;
export type AchType = (typeof ACH_TYPES)[number];

export type AchStatus = "pending_review" | "approved" | "rejected" | "other";
export type AchEvidence = { id: string; fileName: string; mime: string; size: number; downloadUrl: string };
export type AchRecord = {
  id: string;
  type: string; // achievement_type; a value the app does not know is shown as the backend wrote it
  title: string;
  categoryId: string;
  categoryName: string;
  achievedAt: string; // YYYY-MM-DD
  description: string;
  status: AchStatus;
  rejectionReason: string;
  submittedAt: string;
  evidence: AchEvidence[];
};
// What GET /marketplace/lawyers/{id}/achievements shows to everyone.
export type PublicAch = { key: string; type: string; title: string; achievedAt: string; categoryName: string };
export type AchPage<T> = { items: T[]; total: number; next: number | null };

export type AchInput = { type: AchType | ""; title: string; categoryId: string; achievedOn: string; description: string; evidenceIds: string[] };
