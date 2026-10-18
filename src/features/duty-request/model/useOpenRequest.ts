import { useDocLite } from "@/entities/my-document";
import type { ExistingRef } from "@/entities/duty-request";

// Duplicate rule (TZ 14): a document that already has an advocate request blocks a new one.
// Read from the light list — the same backend flags the 409 guard uses — so the form is not even offered.
export function useOpenRequest(templateId: string): ExistingRef | null {
  const rows = useDocLite().data;
  const hit = templateId ? rows?.find((r) => r.templateId === templateId && r.lawyerActive && !r.canSend) : undefined;
  return hit ? { id: hit.id, workId: hit.workId, status: hit.status, message: hit.blockReason } : null;
}
