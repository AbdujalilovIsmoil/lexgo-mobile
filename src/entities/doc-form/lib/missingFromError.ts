import { ApiError } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import { normMissing } from "../api/normResult";
import type { MissingField } from "../model/types";

// 422 from generate: { detail: { message, missing_required_fields: [...] } }.
export function missingFromError(e: unknown): MissingField[] {
  if (!(e instanceof ApiError) || e.status !== 422) return [];
  return normMissing(asDict(e.data.detail).missing_required_fields);
}
