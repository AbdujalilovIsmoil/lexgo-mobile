import type { AchInput } from "../model/types";

export const TITLE_MIN = 2;
export const TITLE_MAX = 255;
export const DESC_MIN = 5;
export const DESC_MAX = 5000;
export const MAX_FILES = 20;
export const MAX_MB = 20;
// §18: PDF, DOC, DOCX, JPEG, PNG, WebP up to 20 MB. The system picker is told the types and the name is checked again.
export const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export const DOC_EXTS = /\.(pdf|jpe?g|png|webp|docx?)$/i;
export const PHOTO_EXTS = /\.(jpe?g|png|webp)$/i;

// Why a picked file cannot be sent: the wrong type (a GIF, a HEIC the phone did not convert) or more than 20 MB.
export function evidenceProblem(f: { name: string; size: number }): "badType" | "tooBig" | null {
  if (!DOC_EXTS.test(f.name)) return "badType";
  return f.size > MAX_MB * 1024 * 1024 ? "tooBig" : null;
}

export type AchIssue = "type" | "title" | "date" | "description" | "files";

// The contract's limits before a submission goes out; `today` is "YYYY-MM-DD" (injectable for tests).
export function achIssues(i: AchInput, today: string): AchIssue[] {
  const out: AchIssue[] = [];
  const title = i.title.trim().length;
  const desc = i.description.trim().length;
  if (!i.type) out.push("type");
  if (title < TITLE_MIN || title > TITLE_MAX) out.push("title");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.achievedOn) || i.achievedOn > today) out.push("date");
  if (desc < DESC_MIN || desc > DESC_MAX) out.push("description");
  if (i.evidenceIds.length > MAX_FILES) out.push("files");
  return out;
}
