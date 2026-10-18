// POST /orders/{id}/decline reasons (the backend list, "other" needs a note).
export const DECLINE_REASONS = ["conflict_of_interest", "not_my_specialization", "busy", "region_far", "price_mismatch", "documents_insufficient", "prior_dispute", "sick_or_vacation", "other"] as const;
export type DeclineReason = (typeof DECLINE_REASONS)[number];
