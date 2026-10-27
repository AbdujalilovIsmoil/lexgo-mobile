import { ApiError, http } from "@/shared/api";
import { asDict, asNum, asStr } from "@/shared/lib/json";
import { isRated } from "../lib/rating";

// Rating v3 (contract §19). The public answer is shown as the stars and the review count only; the ranking score, the components and the
// metrics are never read for a public page. The seller's own answer adds the components and metrics for the "My rating" card.
export type PublicRating = { rated: boolean; rating: number; reviews: number; unratedText: string };
export type RatingPart = { key: string; value: number; penalty: boolean };
export type MyRating = PublicRating & {
  parts: RatingPart[];
  completed: number | null;
  terminal: number | null;
  responseSeconds: number | null;
  experienceYears: number | null;
  policyVersion: string;
  calculatedAt: string;
};

const ORDER = ["client_reviews", "completion_rate", "response_score", "acceptance_rate", "verified_experience", "verified_achievements"];
const PENALTY = /penalt|complaint|refund/i;
const num = (v: unknown): number | null => ((typeof v === "number" || (typeof v === "string" && v.trim())) && Number.isFinite(Number(v)) ? Number(v) : null);

export function normPublicRating(v: unknown): PublicRating {
  const d = asDict(v);
  const rating = asNum(d.public_rating ?? d.rating);
  const reviews = Math.max(0, Math.round(asNum(d.reviews_count)));
  return { rated: isRated(asStr(d.rating_status), rating, reviews), rating, reviews, unratedText: asStr(d.unrated_display).trim() };
}

// The backend's numbers as they are (clamping is the bar's job). Known components first in the contract's order, then any other key the
// backend adds, then the numbers of a `penalties` object.
export function normMyRating(v: unknown): MyRating {
  const d = asDict(v);
  const c = asDict(d.components);
  const m = asDict(d.metrics);
  const keys = [...ORDER.filter((k) => k in c), ...Object.keys(c).filter((k) => !ORDER.includes(k))];
  const parts: RatingPart[] = keys.flatMap((key) => {
    const value = num(c[key]);
    return value === null ? [] : [{ key, value, penalty: PENALTY.test(key) }];
  });
  for (const [key, raw] of Object.entries(asDict(d.penalties))) {
    const value = num(raw);
    if (value !== null) parts.push({ key, value, penalty: true });
  }
  const version = d.policy_version;
  return {
    ...normPublicRating(v),
    parts,
    completed: num(m.completed_orders),
    terminal: num(m.terminal_orders),
    responseSeconds: num(m.average_response_seconds),
    experienceYears: num(m.verified_experience_years),
    policyVersion: typeof version === "number" || typeof version === "string" ? String(version).trim() : "",
    calculatedAt: asStr(d.calculated_at),
  };
}

// 404 = no rating for this seller yet: nothing to show, not an error.
async function read<T>(path: string, norm: (v: unknown) => T): Promise<T | null> {
  try {
    return norm(await http(path));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const getMyRating = () => read("/marketplace/me/rating", normMyRating);
export const getSellerRating = (userId: string) => read(`/marketplace/lawyers/${encodeURIComponent(userId)}/rating`, normPublicRating);
