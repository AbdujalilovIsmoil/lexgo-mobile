export const COMPLAINT_CATEGORIES = ["service", "lawyer", "payment", "quality", "sla", "other"] as const;
export const SUBJECT_MIN = 3;
export const SUBJECT_MAX = 150;
export const DESC_MIN = 15;
export const DESC_MAX = 4000;

// manual: written by the client (POST /complaints); quality: opened by a 1–2 star rating.
export type ComplaintKind = "manual" | "quality";
export type ComplaintSource = "" | "document" | "urgent";
export const COMPLAINT_STAGES: ComplaintStage[] = ["new", "review", "rework", "resolved", "rejected", "closed"];
export type ComplaintStage = "new" | "review" | "rework" | "resolved" | "rejected" | "closed";

export type ComplaintItem = {
  key: string;
  id: string;
  workId: string;
  kind: ComplaintKind;
  category: string;
  subject: string;
  description: string;
  status: string;
  relatedRef: string;
  lawyerName: string;
  operatorName: string;
  operatorNote: string;
  stars: number;
  source: ComplaintSource;
  workTitle: string;
  resolvedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkRef = { id: string; workId: string; type: string; title: string };

// The call centre's verdict in three groups the client can understand (TZ 25).
export function complaintStage(status: string): ComplaintStage {
  if (status === "new") return "new";
  if (status === "rework_required" || status === "rework_in_progress") return "rework";
  if (status === "resolved") return "resolved";
  if (status === "rejected") return "rejected";
  return status === "closed" || status === "cancelled" ? "closed" : "review";
}

export const workRefValue = (w: WorkRef): string => (w.type === "legal_case" ? w.id : w.workId || w.id);
