import type { OnbProgress, OnbState, ProCabinet } from "../model/types";

const SUBMITTED = /^(submitted|in_review|under_review|review|pending_review|reviewing|moderation|waiting_review|sent)$/;
const REJECTED = /^(rejected|declined|denied|failed|blocked)$/;
const APPROVED = /^(approved|verified|active)$/;

// Account + verification + checklist → one state (the backend flags are the truth, TZ 6.2).
export function onboardingState(c: ProCabinet | undefined, p: OnbProgress | undefined): OnbState {
  const ver = c?.verificationStatus ?? "";
  if (REJECTED.test(c?.accountStatus ?? "") || REJECTED.test(ver) || REJECTED.test(p?.status ?? "")) return "rejected";
  if (c && !c.limitedAccess && (c.verified || /^(approved|verified)$/.test(ver)) && APPROVED.test(c.accountStatus || "active")) return "approved";
  if (SUBMITTED.test(p?.status ?? "") || SUBMITTED.test(ver)) return "submitted";
  const all = !!p && p.total > 0 && p.steps.every((s) => s.completed || !s.required);
  return all ? "ready" : "incomplete";
}

export const percentDone = (p: OnbProgress | undefined) => (p && p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0);

// Only an approved seller is listed in the marketplace and may sell.
export const isPublicSeller = (s: OnbState) => s === "approved";
