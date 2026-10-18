import { ApiError } from "@/shared/api";
import { tr } from "./tr";

// User-facing text of a failed call for non-React code (same wording as useErrorText).
export function errText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 0) return tr("common.offline");
    if (e.status === 403) return tr("common.forbidden");
    if (e.status === 429) return tr("common.rateLimited");
    if (e.detail) return e.detail;
  }
  return tr("common.serverError");
}
