import { ApiError, http } from "@/shared/api";
import { asDict, asNum, asStr } from "@/shared/lib/json";

// How a seller's marketplace rating is made (the web's ratingBreakdown): the public stars, the ranking score, each factor out of 100 with
// its weight, the facts behind them and the penalties. GET /marketplace/me/rating (the seller's own) or /marketplace/lawyers/{id}/rating.
export type RatingFactor = { key: string; score: number };
export type RatingPenalties = { complaints: number; complaintPoints: number; refunds: number; refundPoints: number };
export type RatingBreakdown = {
  rated: boolean;
  publicRating: number | null;
  rankingScore: number | null;
  reviews: number;
  unratedText: string;
  factors: RatingFactor[];
  completed: number;
  terminal: number;
  responseSeconds: number | null;
  experienceYears: number | null;
  calculatedAt: string;
  policyVersion: number | null;
  weights: Record<string, number> | null;
  coldStart: boolean;
  penalties: RatingPenalties | null;
};

// The web's order of the five main factors; any other factor the backend adds follows them.
const ORDER = ["client_reviews", "completion_rate", "acceptance_rate", "response_score", "verified_experience"];
const num = (v: unknown): number | null => (v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

export function normRatingBreakdown(v: unknown): RatingBreakdown {
  const d = asDict(v);
  const parts = asDict(d.components);
  const m = asDict(d.metrics);
  const keys = [...ORDER.filter((k) => k in parts), ...Object.keys(parts).filter((k) => !ORDER.includes(k))];
  const status = asStr(d.rating_status).toLowerCase();
  const w = asDict(d.weights);
  const weights = Object.fromEntries(Object.entries(w).filter(([, n]) => typeof n === "number")) as Record<string, number>;
  const p = d.penalties && typeof d.penalties === "object" ? asDict(d.penalties) : null;
  return {
    rated: status ? status !== "unrated" : asNum(d.reviews_count) > 0,
    publicRating: num(d.public_rating),
    rankingScore: num(d.ranking_score),
    reviews: asNum(d.reviews_count),
    unratedText: asStr(d.unrated_display),
    factors: keys.map((key) => ({ key, score: Math.max(0, Math.min(100, asNum(parts[key]))) })),
    completed: asNum(m.completed_orders),
    terminal: asNum(m.terminal_orders),
    responseSeconds: num(m.average_response_seconds),
    experienceYears: num(m.verified_experience_years),
    calculatedAt: asStr(d.calculated_at),
    policyVersion: num(d.policy_version),
    weights: Object.keys(weights).length ? weights : null,
    coldStart: w.cold_start_replaces_client_reviews === true,
    penalties: p ? { complaints: asNum(p.substantiated_complaints), complaintPoints: asNum(p.complaint_points), refunds: asNum(p.refunds), refundPoints: asNum(p.refund_points) } : null,
  };
}

// 404 = no breakdown for this seller yet: nothing to show, not an error.
async function read(path: string): Promise<RatingBreakdown | null> {
  try {
    return normRatingBreakdown(await http(path));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const getMyRating = () => read("/marketplace/me/rating");
export const getSellerRating = (userId: string) => read(`/marketplace/lawyers/${encodeURIComponent(userId)}/rating`);
