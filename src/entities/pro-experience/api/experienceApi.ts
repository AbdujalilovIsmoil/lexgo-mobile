import { ApiError, http } from "@/shared/api";
import { appendFile, type Picked } from "@/shared/lib/upload";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { evidence, normGroups, normRecord, strs } from "./norm";
import type { ExpCategory, ExpEvidence, ExpGroup, ExpInput, ExpRecord } from "../model/types";

export const listMyExperience = async (): Promise<ExpGroup[]> => normGroups(await http("/marketplace/me/experience?limit=50&offset=0"));

const day = (v: string) => (v ? `${v}T00:00:00Z` : null);

// POST /marketplace/me/experience — a new entry, or (with source_id) an edit of one; either goes to review.
export async function submitExperience(i: ExpInput): Promise<ExpRecord | null> {
  const body: Record<string, unknown> = {
    source_id: i.sourceId || null,
    category_id: i.categoryId,
    workplace: i.workplace.trim(),
    position: i.position.trim(),
    started_at: day(i.startedOn),
    ended_at: i.isCurrent ? null : day(i.endedOn),
    is_current: i.isCurrent,
    description: i.description.trim(),
    stages: i.stages,
    results: i.results,
    evidence_ids: i.evidenceIds,
  };
  if (i.subcategoryId) body.subcategory_id = i.subcategoryId;
  return normRecord(asDict(await http("/marketplace/me/experience", { method: "POST", body })));
}

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

// The categories an experience is filed under (top level) and their directions (children).
export async function listCategoryTree(): Promise<ExpCategory[]> {
  const d = await http("/marketplace/service-category-tree");
  return asArr(Array.isArray(d) ? d : asDict(d).items).map((x) => {
    const c = asDict(x);
    return { id: asStr(c.id), title: asStr(c.title ?? c.name), children: asArr(c.children).map((y) => ({ id: asStr(asDict(y).id), title: asStr(asDict(y).title ?? asDict(y).name) })).filter((y) => y.id) };
  }).filter((c) => c.id && c.title);
}

// `experience_*` validation codes name the field they are about.
export function experienceErrorOf(e: unknown): { code: string; field: string } | null {
  if (!(e instanceof ApiError)) return null;
  const d = asDict(e.data.detail);
  const code = asStr(d.code) || e.code || "";
  if (!code.startsWith("experience_")) return null;
  return { code, field: asStr(d.field) || strs(d.fields)[0] || "" };
}
