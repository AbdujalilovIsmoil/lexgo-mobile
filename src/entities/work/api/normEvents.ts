import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { Work } from "../model/types";
import type { WorkEvent } from "../model/detailTypes";

const byTime = (a: WorkEvent, b: WorkEvent) => (a.at > b.at ? 1 : a.at < b.at ? -1 : 0);
const dedupe = (list: WorkEvent[]) => list.filter((e, i) => i === 0 || e.status !== list[i - 1].status);

// Where the backend gives no history we show what it does give: opened, and the current state.
export function baseEvents(w: Work): WorkEvent[] {
  const first: WorkEvent = { key: "created", status: "created", at: w.createdAt, note: "" };
  return w.updatedAt && w.updatedAt !== w.createdAt ? [first, { key: "now", status: w.status, at: w.updatedAt, note: "" }] : [first];
}

// Urgent: payload.status_history = [{from, to, changed_at}].
export function urgentEvents(w: Work, history: unknown, note: string): WorkEvent[] {
  const list = asArr(history).map((x, i) => {
    const d = asDict(x);
    return { key: `h${i}`, status: asStr(d.to), at: asStr(d.changed_at), note: i === asArr(history).length - 1 ? note : "" };
  });
  return list.length ? [{ key: "created", status: "created", at: w.createdAt, note: "" }, ...list.sort(byTime)] : baseEvents(w);
}

// Order: status_history rows carry payload.status / payload.note.
export function orderEvents(w: Work, history: unknown): WorkEvent[] {
  const list = asArr(history).map((x, i) => {
    const d = asDict(x);
    const p = asDict(d.payload);
    return { key: `h${i}`, status: asStr(p.status) || asStr(d.record_type), at: asStr(d.created_at), note: asStr(p.note) };
  });
  return list.length ? dedupe([{ key: "created", status: "created", at: w.createdAt, note: "" }, ...list.sort(byTime)]) : baseEvents(w);
}

// Case: timeline rows are records (module case_timeline) with payload.{status, stage, next_action}.
export function caseEvents(w: Work, timeline: unknown): WorkEvent[] {
  const list = asArr(timeline).map((x, i) => {
    const d = asDict(x);
    const p = asDict(d.payload);
    return { key: `t${i}`, status: asStr(p.status) || asStr(p.stage) || asStr(d.status), at: asStr(d.created_at), note: asStr(p.next_action) };
  });
  return list.length ? dedupe([{ key: "created", status: "created", at: w.createdAt, note: "" }, ...list.sort(byTime)]) : baseEvents(w);
}
