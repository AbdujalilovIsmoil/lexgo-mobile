import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { DutyCtor, DutyResult, ExistingRef } from "../model/types";

// The lawyer request of a template with no linked service (README §11.4–§12): the pure decisions.

type Flags = { id: string; workId: string; status: string; lawyerActive: boolean; canSend: boolean; blockReason: string };

// Duplicate protection (§11.5): while `can_send_lawyer_request` is false and a request is active, nothing new is sent — the existing one is opened.
export function blockedBy(d: Flags | null | undefined): ExistingRef | null {
  return d && d.lawyerActive && !d.canSend && d.id ? { id: d.id, workId: d.workId, status: d.status, message: d.blockReason } : null;
}

// The body of POST …/lawyer-review. `pageCount` 0 and urgency "normal" are the defaults; the language rides along (the endpoint takes free-form JSON).
export function reviewBody(i: { need: string; requestedType?: string; pageCount?: number; urgency?: string; language?: string }): Record<string, unknown> {
  const body: Record<string, unknown> = { need: i.need };
  if (i.requestedType) body.requested_document_type = i.requestedType;
  body.page_count = i.pageCount ?? 0;
  body.urgency = i.urgency || "normal";
  if (i.language) body.language = i.language;
  return body;
}

// The constructor answers to save before the request goes out: the person's draft, as the full current object (PUT …/answers replaces them all,
// so an empty draft must never be sent — it would wipe what the constructor already saved on the server). null = nothing to save.
export function answersToSave(draft: Record<string, unknown> | undefined): Record<string, unknown> | null {
  const filled = Object.entries(draft ?? {}).filter(([, v]) => (typeof v === "string" ? v.trim() !== "" : v !== undefined && v !== null));
  return filled.length ? Object.fromEntries(filled) : null;
}

// The continuation question is shown once per request, and only when the backend asks for it (`available` and `prompt_required`).
const asked = new Set<string>();
registerSessionReset(() => asked.clear());
export const ctorPromptFor = (r: Pick<DutyResult, "docId" | "created" | "ctor">): DutyCtor | null =>
  r.created && r.docId && r.ctor && r.ctor.available && r.ctor.promptRequired && !asked.has(r.docId) ? r.ctor : null;
export const markCtorAsked = (docId: string): void => void asked.add(docId);
export const wasCtorAsked = (docId: string): boolean => asked.has(docId); // My Documents asks the same question: not twice for one request
export const resetCtorAsked = (): void => asked.clear(); // tests

// Document requests started in this session for a template (by user and template), so a retry after an unknown outcome never creates a second one.
const started = new Map<string, string>();
registerSessionReset(() => started.clear());
export const startedDoc = (templateId: string): string => started.get(templateId) ?? "";
export const rememberStarted = (templateId: string, docId: string): void => void started.set(templateId, docId);
export const resetStarted = (): void => started.clear(); // tests
