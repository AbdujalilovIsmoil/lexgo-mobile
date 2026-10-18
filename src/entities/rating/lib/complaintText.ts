import type { ComplaintItem, WorkRef } from "../model/complaint";
import { workRefValue } from "../model/complaint";

export const foldText = (s: string): string => s.toLowerCase().replace(/[ʻʼ‘’`´]/g, "'").replace(/\s+/g, " ").trim();

const OPAQUE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isOpaqueRef = (ref: string): boolean => OPAQUE.test(ref.trim());

// Search box: subject, text, public id, id and the linked work (same fields as the web).
export function complaintMatches(c: ComplaintItem, query: string, extra: string[] = []): boolean {
  const q = foldText(query);
  return !q || [c.subject, c.description, c.workId, c.id, c.relatedRef, ...extra].some((v) => !!v && foldText(v).includes(q));
}

// A link like ?work=ADV-1 points at a complaint by its id or public id.
export const matchesRef = (c: Pick<ComplaintItem, "id" | "workId">, ref: string): boolean => {
  const r = ref.trim().toLowerCase();
  return !!r && (c.id.toLowerCase() === r || c.workId.toLowerCase() === r);
};

export const findWorkRef = (list: WorkRef[], ref: string): WorkRef | null =>
  ref ? list.find((w) => workRefValue(w) === ref) ?? list.find((w) => matchesRef(w, ref)) ?? null : null;

// Where "open the work" goes in the app, by the kind of work.
export function workRoute(type: string, workId: string): string {
  if (workId) return `/works/${encodeURIComponent(workId)}`;
  return type === "document_lawyer_work" ? "/documents" : type === "urgent_advokat" ? "/urgent" : "/works";
}
export const sourceRoute = (s: ComplaintItem["source"]): string => (s === "document" ? "/documents" : s === "urgent" ? "/urgent" : "");
