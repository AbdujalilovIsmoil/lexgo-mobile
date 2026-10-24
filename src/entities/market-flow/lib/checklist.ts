import type { CheckItem, CheckStatus, Checklist } from "../model/types";

// Items that still stop the completion (TZ §9): a required one not done, or skipped although the backend does not allow skipping it.
export const blockingOf = (c: Checklist | null | undefined): CheckItem[] =>
  (c?.items ?? []).filter((i) => i.required && (i.status === "pending" || (i.status === "skipped_with_reason" && !i.skipAllowed)));

export type CheckDraft = { status: CheckStatus; comment: string; files: number; images: number };
export type CheckIssue = "noSkipRequired" | "needReason" | "needComment" | "needFile" | "needImage";

// What a draft still lacks before it may be saved — the same rules the backend checks, so the seller sees them before sending.
export function checkIssue(i: CheckItem, d: CheckDraft): CheckIssue | null {
  if (d.status === "skipped_with_reason") {
    if (!i.skipAllowed) return "noSkipRequired";
    return d.comment.trim() ? null : "needReason";
  }
  if (d.status !== "done") return null;
  if (i.commentRequired && !d.comment.trim()) return "needComment";
  if (i.fileRequired && !d.files) return "needFile";
  if (i.imageRequired && !d.images) return "needImage";
  return null;
}
