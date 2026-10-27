import { http } from "@/shared/api";
import { ApiError } from "@/shared/api/errors";
import { appendFile, type Picked } from "@/shared/lib/upload";
import { asDict } from "@/shared/lib/json";
import { normAchievement, normEvidence, normPage, normPublic } from "./norm";
import type { AchEvidence, AchInput, AchPage, AchRecord, PublicAch } from "../model/types";

export const PAGE_SIZE = 10; // lists show ten at a time

// GET /marketplace/me/achievements?limit=&offset= — one page of the seller's own achievements.
export async function listMyAchievements(offset: number): Promise<AchPage<AchRecord>> {
  return normPage(await http(`/marketplace/me/achievements?limit=${PAGE_SIZE}&offset=${offset}`), offset, PAGE_SIZE, normAchievement);
}

// GET /marketplace/lawyers/{id}/achievements — public, safe fields only.
export async function listPublicAchievements(sellerId: string, offset: number): Promise<AchPage<PublicAch>> {
  return normPage(await http(`/marketplace/lawyers/${encodeURIComponent(sellerId)}/achievements?limit=${PAGE_SIZE}&offset=${offset}`), offset, PAGE_SIZE, normPublic);
}

// The body of POST /marketplace/me/achievements (AchievementSubmission); the category is left out when none is chosen.
export function submissionBody(i: AchInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    achievement_type: i.type,
    title: i.title.trim(),
    achieved_at: i.achievedOn,
    description: i.description.trim(),
    evidence_ids: i.evidenceIds,
  };
  if (i.categoryId) body.category_id = i.categoryId;
  return body;
}

// A new achievement goes to review; the answer is the created row.
export async function submitAchievement(i: AchInput): Promise<AchRecord | null> {
  return normAchievement(asDict(await http("/marketplace/me/achievements", { method: "POST", body: submissionBody(i) })));
}

// POST /marketplace/me/achievements/evidence (multipart `file`) → the id the submission refers to.
export async function uploadAchEvidence(file: Picked): Promise<AchEvidence> {
  const form = new FormData();
  appendFile(form, "file", file);
  const e = normEvidence(await http("/marketplace/me/achievements/evidence", { method: "POST", body: form }));
  if (!e.id) throw new ApiError(502, "upload_without_id");
  return e;
}
