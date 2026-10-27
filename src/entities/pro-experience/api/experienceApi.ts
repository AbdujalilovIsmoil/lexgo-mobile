import { http } from "@/shared/api";
import { ApiError } from "@/shared/api/errors";
import { appendFile, type Picked } from "@/shared/lib/upload";
import { asArr, asDict, asNum, type Dict } from "@/shared/lib/json";
import { evidence, normPages, normRecord, normTree } from "./norm";
import { headIndex } from "../lib/positions";
import { normHistory } from "./normHistory";
import type { ExpCategory, ExpEvidence, ExpGroup, ExpHistory, ExpInput, ExpRecord } from "../model/types";

const LIMIT = 100; // the backend allows 1..200
const MAX_PAGES = 10; // a thousand revisions: far beyond any real profile, and the loop always ends

// GET /marketplace/me/experience is paged (limit / offset / has_more, §3.5): every page is read and the entries are merged by root.
export async function listMyExperience(): Promise<ExpGroup[]> {
  const pages: Dict[] = [];
  for (let offset = 0; pages.length < MAX_PAGES; ) {
    const raw = await http(`/marketplace/me/experience?limit=${LIMIT}&offset=${offset}`);
    const d = Array.isArray(raw) ? { items: raw } : asDict(raw);
    pages.push(d);
    const step = asNum(d.count, 0) || asArr(d.items).length || asArr(d.groups).length;
    if (d.has_more !== true || step <= 0) break;
    offset += step;
  }
  return normPages(pages);
}

// GET …/experience/{id}/history: every revision of the entry and every call-center decision (any revision id of the entry works).
export const getExperienceHistory = async (id: string): Promise<ExpHistory> => normHistory(await http(`/marketplace/me/experience/${encodeURIComponent(id)}/history`));

const day = (v: string) => (v ? `${v}T00:00:00Z` : null);

// POST /marketplace/me/experience — a new entry, or (with source_id = the approved revision) an edit of one; either goes to review.
// `positions[]` carries every position of the workplace (§15). The legacy single position / started_at / ended_at / is_current are sent
// too, filled from the position held now (else the newest), because an older backend reads only those. The backend computes `years`
// itself; a whole-category entry has no subcategory_id.
export async function submitExperience(i: ExpInput): Promise<ExpRecord | null> {
  const positions = i.positions.map((p) => ({ title: p.title.trim(), started_at: day(p.startedOn), ended_at: p.isCurrent ? null : day(p.endedOn), is_current: p.isCurrent, description: p.description.trim() }));
  const head = positions[headIndex(i.positions)];
  const body: Record<string, unknown> = {
    source_id: i.sourceId || null,
    category_id: i.categoryId,
    workplace: i.workplace.trim(),
    positions,
    position: head?.title ?? "",
    started_at: head?.started_at ?? null,
    ended_at: head?.ended_at ?? null,
    is_current: head?.is_current ?? false,
    description: i.description.trim(),
    stages: i.stages,
    results: i.results,
    evidence_ids: i.evidenceIds,
  };
  if (i.subcategoryId) body.subcategory_id = i.subcategoryId;
  return normRecord(asDict(await http("/marketplace/me/experience", { method: "POST", body })));
}

// Only a revision under review can be withdrawn (§3.7).
export async function cancelExperience(id: string): Promise<void> {
  await http(`/marketplace/me/experience/${encodeURIComponent(id)}/cancel`, { method: "POST" });
}

// POST /marketplace/me/experience/evidence (multipart `file`) → the id the submission refers to.
export async function uploadEvidence(file: Picked): Promise<ExpEvidence> {
  const form = new FormData();
  appendFile(form, "file", file);
  const e = evidence(await http("/marketplace/me/experience/evidence", { method: "POST", body: form }));
  if (!e.id) throw new ApiError(502, "upload_without_id");
  return e;
}

// The categories an experience is filed under, with their real child ids (one tree for every category select).
export const listCategoryTree = async (): Promise<ExpCategory[]> => normTree(await http("/service-categories/tree"));
