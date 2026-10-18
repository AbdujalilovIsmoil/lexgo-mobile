// The 15-minute rating/complaint window, exactly as the backend reports it (TZ 25). The app never
// decides it is open by subtracting dates: open = available && !submitted. `remainingSeconds` is
// the server's own count, taken at `fetchedAt`, so a wrong phone clock cannot extend or cut it.
export type RatingWindow = {
  available: boolean;
  submitted: boolean;
  deadlineAt: string;
  remainingSeconds: number;
  closedReason: string; // expired | submitted | not_ready | deadline_missing …
  stars: number; // the rating already given, 0 if none
  comment: string;
  fetchedAt: number;
};

export type RateKind = "document" | "urgent" | "review" | "market";

export type RateTarget = {
  kind: RateKind;
  recordId: string; // internal id the rating endpoints take (never shown)
  workId: string; // public id (ADV-xxxxx, DOC-xxxxx, ORD-xxxxx)
  title: string;
  status: string;
  lawyerName: string;
  lawyerUserId: string;
  window: RatingWindow;
  ratingUrl?: string; // market: POST here ({rating, comment}), the order's own rating_url
};

// Opened by the backend by itself when a rating is 1 or 2 stars.
export type QualityComplaintRef = { id: string; workId: string; status: string };

export type ReviewRow = { id: string; lawyerName: string; stars: number; comment: string; status: string; createdAt: string };
export type PendingReview = { id: string; caseId: string; lawyerUserId: string; lawyerName: string; title: string };

export const COMPLAINT_RATING_MAX = 2;
export const opensComplaint = (stars: number): boolean => stars > 0 && stars <= COMPLAINT_RATING_MAX;

// A finished marketplace job awaiting its review, shaped like a rate target (no 15-minute window).
export const reviewTargetOf = (p: PendingReview): RateTarget => ({
  kind: "review",
  recordId: p.caseId,
  workId: "",
  title: p.title,
  status: "completed",
  lawyerName: p.lawyerName,
  lawyerUserId: p.lawyerUserId,
  window: { available: true, submitted: false, deadlineAt: "", remainingSeconds: 0, closedReason: "", stars: 0, comment: "", fetchedAt: 0 },
});
