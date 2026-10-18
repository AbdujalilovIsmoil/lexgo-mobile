import { asDict, asStr } from "@/shared/lib/json";
import type { Work } from "../model/types";
import { baseEvents, caseEvents } from "./normEvents";
import { normComplaint } from "./normComplaint";
import type { Part } from "./normDoc";

const EMPTY: Part = { roomId: "", callId: "", payment: null, timeline: [], files: [], rating: null, complaints: [], related: null, info: {} };

// legal_case: summary, case, timeline.
export function normCase(w: Work, d: Record<string, unknown>): Part {
  const c = asDict(d.case);
  return { ...EMPTY, related: { kind: "case", id: w.workId }, timeline: caseEvents(w, d.timeline), info: { caseNumber: asStr(c.case_number), stage: asStr(c.stage), description: asStr(c.description), deadline: asStr(c.deadline_at) } };
}

// complaint / quality_complaint: summary, complaint, document, lawyer_request, review.
export function normComplaintWork(w: Work, d: Record<string, unknown>): Part {
  const c = asDict(d.complaint);
  const resolved = asStr(asDict(c.payload).resolved_at);
  const events = baseEvents(w);
  return { ...EMPTY, related: { kind: "complaint", id: w.workId }, timeline: resolved ? [...events.slice(0, 1), { key: "resolved", status: asStr(asDict(c.payload).resolved_action) || w.status, at: resolved, note: "" }] : events, complaints: [normComplaint(c)] };
}

export const normUnknown = (w: Work): Part => ({ ...EMPTY, timeline: baseEvents(w) });
